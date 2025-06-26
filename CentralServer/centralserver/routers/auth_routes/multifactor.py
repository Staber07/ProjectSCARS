import datetime
import uuid
from typing import Annotated

import pyotp
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from centralserver import info
from centralserver.internals.auth_handler import (
    create_access_token,
    verify_access_token,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.exceptions import EmailTemplateNotFoundError
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.mail_handler import get_template, send_mail
from centralserver.internals.models.notification import NotificationType
from centralserver.internals.models.token import (
    DecodedJWTToken,
    JWTToken,
    OTPRecoveryCode,
    OTPToken,
    OTPVerificationToken,
)
from centralserver.internals.models.user import User
from centralserver.internals.notification_handler import push_notification

logger = LoggerFactory().get_logger(__name__)
router = APIRouter(prefix="/mfa/otp")
logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.post("/generate")
async def generate_mfa_otp(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> OTPToken:
    """Generate a new OTP secret for MFA (Multi-Factor Authentication)."""

    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.otpSecret is not None and user.otpVerified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA OTP is already enabled for this user.",
        )

    user.otpSecret = pyotp.random_base32()
    user.otpVerified = False
    user.otpRecoveryCode = str(uuid.uuid4())
    user.otpProvisioningUri = pyotp.totp.TOTP(user.otpSecret).provisioning_uri(
        name=user.username, issuer_name=info.Program.name
    )

    session.commit()
    session.refresh(user)
    logger.info("MFA OTP generated for user: %s", user.username)

    return OTPToken(
        secret=user.otpSecret,
        recovery_code=user.otpRecoveryCode,
        provisioning_uri=user.otpProvisioningUri,
    )


@router.post("/verify")
async def verify_mfa_otp(
    token: logged_in_dep,
    otp: str,
    session: Annotated[Session, Depends(get_db_session)],
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    """Verify the user's OTP for Multi-Factor Authentication."""

    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.otpSecret is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA OTP is not enabled for this user.",
        )

    totp = pyotp.TOTP(user.otpSecret)
    if not totp.verify(otp):
        logger.warning("Invalid OTP provided by user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP provided.",
        )

    user.otpVerified = True
    session.commit()
    session.refresh(user)
    logger.info("MFA OTP verified for user: %s", user.username)
    await push_notification(
        owner_id=user.id,
        title="Two-Factor Authentication Enabled",
        content="You have successfully enabled Two-Factor Authentication (2FA) for your account.",
        notification_type=NotificationType.SECURITY,
        session=session,
    )

    try:
        if user.email:
            background_tasks.add_task(
                send_mail,
                to_address=user.email,
                subject=f"{info.Program.name} | Two-Factor Authentication Enabled",
                text=get_template("mfa_otp_enabled.txt").format(
                    name=user.nameFirst or user.username,
                    app_name=info.Program.name,
                ),
                html=get_template("mfa_otp_enabled.html").format(
                    name=user.nameFirst or user.username,
                    app_name=info.Program.name,
                ),
            )

    except EmailTemplateNotFoundError:
        # This is not critical, so we log the error and continue
        logger.error("Template for MFA OTP enabled email not found.")

    return {"message": "MFA OTP verified successfully."}


@router.post("/validate")
async def validate_mfa_otp(
    otp_verification: OTPVerificationToken,
    session: Annotated[Session, Depends(get_db_session)],
    request: Request,
) -> JWTToken:
    """Validate the user's OTP for Multi-Factor Authentication."""

    user = session.exec(
        select(User).where(User.otpNonce == otp_verification.nonce)
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.otpSecret is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA OTP is not enabled for this user.",
        )

    totp = pyotp.TOTP(user.otpSecret)
    if user.otpNonceExpires is None or user.otpNonceExpires.replace(
        tzinfo=datetime.timezone.utc
    ) < datetime.datetime.now(datetime.timezone.utc):
        logger.warning("OTP nonce has expired for user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP nonce has expired.",
        )

    if user.otpNonce != otp_verification.nonce:
        logger.warning("Invalid nonce provided by user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid nonce provided.",
        )

    if not totp.verify(otp_verification.otp):
        logger.warning("Invalid OTP provided by user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP provided.",
        )

    logger.info("MFA OTP validated successfully for user: %s", user.username)
    user.lastLoggedInTime = datetime.datetime.now(datetime.timezone.utc)
    user.lastLoggedInIp = request.client.host if request.client else None
    user.otpNonce = None
    user.otpNonceExpires = None
    session.commit()
    session.refresh(user)
    return JWTToken(
        uid=uuid.uuid4(),
        access_token=await create_access_token(
            user.id,
            datetime.timedelta(
                minutes=app_config.authentication.access_token_expire_minutes
            ),
            False,
        ),
        token_type="bearer",
    )


@router.post("/recovery")
async def mfa_otp_recovery(
    recovery_data: OTPRecoveryCode,
    session: Annotated[Session, Depends(get_db_session)],
    request: Request,
    background_tasks: BackgroundTasks,
) -> JWTToken:
    """Recover access using the OTP recovery code for Multi-Factor Authentication."""

    user = session.exec(
        select(User).where(User.otpNonce == recovery_data.nonce)
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.otpSecret is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA OTP is not enabled for this user.",
        )

    if user.otpNonceExpires is None or user.otpNonceExpires.replace(
        tzinfo=datetime.timezone.utc
    ) < datetime.datetime.now(datetime.timezone.utc):
        logger.warning("OTP nonce has expired for user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP nonce has expired.",
        )

    if user.otpNonce != recovery_data.nonce:
        logger.warning("Invalid nonce provided by user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid nonce provided.",
        )

    if (
        user.otpRecoveryCode is None
        or user.otpRecoveryCode != recovery_data.recovery_code
    ):
        logger.warning("Invalid recovery code provided by user: %s", user.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid recovery code provided.",
        )

    logger.info(
        "MFA OTP recovery code validated successfully for user: %s", user.username
    )
    user.lastLoggedInTime = datetime.datetime.now(datetime.timezone.utc)
    user.lastLoggedInIp = request.client.host if request.client else None
    user.otpNonce = None
    user.otpNonceExpires = None
    user.otpSecret = None
    user.otpVerified = False
    user.otpRecoveryCode = None
    user.otpProvisioningUri = None

    session.commit()
    session.refresh(user)

    await push_notification(
        owner_id=user.id,
        title="Two-Factor Authentication Disabled",
        content="You have successfully disabled Two-Factor Authentication (2FA) for your account.",
        notification_type=NotificationType.SECURITY,
        session=session,
    )

    try:
        if user.email:
            background_tasks.add_task(
                send_mail,
                to_address=user.email,
                subject=f"{info.Program.name} | Two-Factor Authentication Disabled",
                text=get_template("mfa_otp_disabled.txt").format(
                    name=user.nameFirst or user.username,
                    app_name=info.Program.name,
                ),
                html=get_template("mfa_otp_disabled.html").format(
                    name=user.nameFirst or user.username,
                    app_name=info.Program.name,
                ),
            )

    except EmailTemplateNotFoundError:
        # This is not critical, so we log the error and continue
        logger.error("Template for MFA OTP disabled email not found.")

    return JWTToken(
        uid=uuid.uuid4(),
        access_token=await create_access_token(
            user.id,
            datetime.timedelta(
                minutes=app_config.authentication.access_token_expire_minutes
            ),
            False,
        ),
        token_type="bearer",
    )


@router.post("/disable")
async def disable_mfa_otp(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    """Disable the user's OTP for Multi-Factor Authentication."""

    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.otpSecret is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA OTP is not enabled for this user.",
        )

    user.otpSecret = None
    user.otpVerified = False
    user.otpRecoveryCode = None
    user.otpProvisioningUri = None

    session.commit()
    session.refresh(user)
    logger.info("MFA OTP disabled for user: %s", user.username)

    await push_notification(
        owner_id=user.id,
        title="Two-Factor Authentication Disabled",
        content="You have successfully disabled Two-Factor Authentication (2FA) for your account.",
        notification_type=NotificationType.SECURITY,
        session=session,
    )

    try:
        if user.email:
            background_tasks.add_task(
                send_mail,
                to_address=user.email,
                subject=f"{info.Program.name} | Two-Factor Authentication Disabled",
                text=get_template("mfa_otp_disabled.txt").format(
                    name=user.nameFirst or user.username,
                    app_name=info.Program.name,
                ),
                html=get_template("mfa_otp_disabled.html").format(
                    name=user.nameFirst or user.username,
                    app_name=info.Program.name,
                ),
            )

    except EmailTemplateNotFoundError:
        # This is not critical, so we log the error and continue
        logger.error("Template for MFA OTP disabled email not found.")

    return {"message": "MFA OTP disabled successfully."}
