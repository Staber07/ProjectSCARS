import datetime
import uuid
from typing import Annotated, Literal

import pyotp
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from pydantic import EmailStr
from sqlmodel import Session, select

from centralserver import info
from centralserver.internals.adapters.oauth import GoogleOAuthAdapter
from centralserver.internals.auth_handler import (
    authenticate_user,
    create_access_token,
    oauth_google_authenticate,
    oauth_google_link,
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.exceptions import EmailTemplateNotFoundError
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.mail_handler import get_template, send_mail
from centralserver.internals.models.notification import NotificationType
from centralserver.internals.models.role import Role
from centralserver.internals.models.token import (
    DecodedJWTToken,
    JWTToken,
    OTPToken,
    OTPVerificationToken,
)
from centralserver.internals.models.user import (
    User,
    UserCreate,
    UserPasswordResetRequest,
    UserPublic,
)
from centralserver.internals.notification_handler import push_notification
from centralserver.internals.user_handler import (
    create_user,
    crypt_ctx,
    validate_password,
)

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/auth",
    tags=["authentication"],
    # dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]

google_oauth_adapter = (
    GoogleOAuthAdapter(app_config.authentication.oauth.google)
    if app_config.authentication.oauth.google is not None
    else None
)


@router.post("/create", response_model=UserPublic)
async def create_new_user(
    new_user: UserCreate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> Response:
    """Create a new user in the database.

    Args:
        new_user: The new user's information.
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A newly created user object.
    """

    if not await verify_user_permission("users:create", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create a user.",
        )

    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User not found."
        )

    user_role = session.get(Role, new_user.roleId)
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role ID provided.",
        )

    if new_user.roleId < user.roleId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create a user with this role.",
        )

    logger.info("Creating new user: %s", new_user.username)
    logger.debug("Created by user: %s", token.id)
    user = UserPublic.model_validate(await create_user(new_user, session))
    logger.debug("Returning new user information: %s", user)
    return Response(
        content=user.model_dump_json(),
        status_code=status.HTTP_201_CREATED,
        media_type="application/json",
    )


@router.post("/login")
async def request_access_token(
    data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_db_session)],
    request: Request,
) -> JWTToken | dict[str, str]:
    """Get an access token for a user.

    Args:
        data: The data from the OAuth2 password request form.
        session: The database session.
        request: The HTTP request object.

    Returns:
        A JWT token or a MFA code if MFA is enabled.

    Raises:
        HTTPException: If the user cannot be authenticated.
    """

    logger.info("Requesting access token for user: %s", data.username)
    user: User | tuple[int, str] = await authenticate_user(
        data.username,
        data.password,
        request.client.host if request.client else None,
        session,
    )

    if isinstance(user, tuple):
        logger.warning(
            "Failed to authenticate user %s: %s (%s)", data.username, user[1], user[0]
        )
        raise HTTPException(
            status_code=user[0],
            detail=user[1],
        )

    if user.otpSecret and user.otpVerified:
        otp_nonce = str(uuid.uuid4())
        user.otpNonce = otp_nonce
        user.otpNonceExpires = datetime.datetime.now(
            datetime.timezone.utc
        ) + datetime.timedelta(
            minutes=app_config.authentication.otp_nonce_expire_minutes
        )
        logger.info("MFA OTP is enabled for user %s. Returning nonce", user.username)
        resp = {
            "message": "MFA OTP is enabled. Please provide your OTP to continue.",
            "otp_nonce": otp_nonce,
        }

    else:
        user.lastLoggedInTime = datetime.datetime.now(datetime.timezone.utc)
        user.lastLoggedInIp = request.client.host if request.client else None
        resp = JWTToken(
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

    session.commit()
    session.refresh(user)
    return resp


@router.post("/email/request")
async def request_verification_email(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Send a verification email to a user.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A message indicating the success of the operation.

    Raises:
        HTTPException: If the token is invalid or expired.
    """

    logger.info("Verifying email with token: %s", token)
    user = session.get(User, token.id)

    if not user:
        logger.warning("User not found for email verification: %s", token.id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.deactivated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    if not user.email:
        logger.warning(
            "User %s does not have an email address set.",
            user.username,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user does not have an email address set.",
        )

    session.commit()
    session.refresh(user)

    # Generate a verification token and set its expiration time
    user.verificationToken = str(uuid.uuid4())
    user.verificationTokenExpires = datetime.datetime.now(
        datetime.timezone.utc
    ) + datetime.timedelta(
        # NOTE: Reusing recovery token expiration time for email verification
        minutes=app_config.authentication.recovery_token_expire_minutes
    )
    session.commit()
    session.refresh(user)
    recovery_link = f"{app_config.connection.base_url}/account/profile?emailVerificationToken={user.verificationToken}"
    logger.debug(
        "Generated verification link for user %s: %s", user.username, recovery_link
    )
    logger.info("Email verified successfully for user: %s", user.username)
    try:
        send_mail(
            to_address=user.email,
            subject=f"{info.Program.name} | Email Verification Request",
            text=get_template("email_verification.txt").format(
                name=user.nameFirst or user.username,
                app_name=info.Program.name,
                verification_link=recovery_link,
                expiration_time=app_config.authentication.recovery_token_expire_minutes,
            ),
            html=get_template("email_verification.html").format(
                name=user.nameFirst or user.username,
                app_name=info.Program.name,
                verification_link=recovery_link,
                expiration_time=app_config.authentication.recovery_token_expire_minutes,
            ),
        )

    except EmailTemplateNotFoundError as e:
        logger.error("Template for email verification not found.")
        logger.debug("User's email verification link: %s", recovery_link)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please contact support.",
        ) from e

    return {"message": "Email verification sent successfully."}


@router.post("/email/verify")
async def verify_email(
    token: str,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Verify a user's email address using a verification token.

    Args:
        token: The verification token.
        session: The database session.

    Returns:
        A message indicating the success of the operation.

    Raises:
        HTTPException: If the token is invalid or expired.
    """

    logger.info("Verifying email with token: %s", token)
    user = session.exec(select(User).where(User.verificationToken == token)).first()

    if not user or not user.verificationToken or not user.verificationTokenExpires:
        logger.warning("Invalid or missing verification token: %s", token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or missing verification token.",
        )

    if user.deactivated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    if user.verificationTokenExpires.replace(
        tzinfo=datetime.timezone.utc
    ) < datetime.datetime.now(datetime.timezone.utc):
        logger.warning("Expired verification token: %s", token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expired verification token.",
        )

    user.emailVerified = True
    user.verificationToken = None
    user.verificationTokenExpires = None
    session.commit()
    session.refresh(user)
    await push_notification(
        owner_id=user.id,
        title="Email address verified!",
        content=f"Your email address ({user.email}) has been successfully verified.",
        notification_type=NotificationType.MAIL,
        session=session,
    )
    logger.info("Email verified successfully for user: %s", user.username)

    return {"message": "Email verified successfully."}


@router.post("/recovery/request")
async def request_password_recovery(
    username: str, email: EmailStr, session: Annotated[Session, Depends(get_db_session)]
) -> dict[Literal["message"], str]:
    """Request a password recovery for a user.

    Args:
        username: The username of the user.
        email: The email address of the user.
        session: The database session.
    """

    logger.info("Requesting password recovery for user: %s", username)
    user = session.exec(select(User).where(User.username == username)).first()

    if not user:
        logger.warning("User not found for password recovery: %s", username)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not user.email:
        logger.warning(
            "User %s does not have an email address set for password recovery.",
            username,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user does not have an email address set for password recovery.",
        )

    if user.email != email:
        logger.warning(
            "Email mismatch for user %s: provided %s, expected %s",
            username,
            email,
            user.email,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email does not match the user's email address.",
        )

    if user.emailVerified is False:
        logger.warning(
            "User %s has not verified their email address, cannot proceed with password recovery.",
            username,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User's email address is not verified.",
        )

    # Generate a recovery token and set its expiration time
    user.recoveryToken = str(uuid.uuid4())
    user.recoveryTokenExpires = datetime.datetime.now(
        datetime.timezone.utc
    ) + datetime.timedelta(
        minutes=app_config.authentication.recovery_token_expire_minutes
    )
    session.commit()
    session.refresh(user)
    recovery_link = (
        f"{app_config.connection.base_url}/resetPassword?token={user.recoveryToken}"
    )
    logger.debug("Generated recovery link for user %s: %s", username, recovery_link)

    try:
        send_mail(
            to_address=user.email,
            subject=f"{info.Program.name} | Password Recovery Request",
            text=get_template("password_recovery.txt").format(
                name=user.nameFirst or user.username,
                app_name=info.Program.name,
                recovery_link=recovery_link,
                expiration_time=app_config.authentication.recovery_token_expire_minutes,
            ),
            html=get_template("password_recovery.html").format(
                name=user.nameFirst or user.username,
                app_name=info.Program.name,
                recovery_link=recovery_link,
                expiration_time=app_config.authentication.recovery_token_expire_minutes,
            ),
        )

    except EmailTemplateNotFoundError:
        logger.error("Template for password recovery email not found.")
        logger.debug("User's password recovery link: %s", recovery_link)

    return {"message": "ok"}


@router.post("/recovery/reset")
async def reset_password(
    data: UserPasswordResetRequest,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Reset a user's password using a recovery token.

    Args:
        token: The recovery token.
        new_password: The new password for the user.
        session: The database session.

    Returns:
        A message indicating the success of the operation.
    """

    logger.info("Resetting password for token: %s", data.recovery_token)
    user = session.exec(
        select(User).where(User.recoveryToken == data.recovery_token)
    ).first()

    if not user or not user.recoveryToken or not user.recoveryTokenExpires:
        logger.warning(
            "Invalid or missing recovery token or user: %s", data.recovery_token
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or missing recovery token or user.",
        )

    if user.deactivated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    password_is_valid, password_err = await validate_password(data.new_password)
    if not password_is_valid:
        logger.warning(
            "Failed to reset password for user: %s (%s)", user.username, password_err
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid password format ({password_err})",
        )

    logger.debug(
        "%s < %s",
        user.recoveryTokenExpires.replace(tzinfo=datetime.timezone.utc),
        datetime.datetime.now(datetime.timezone.utc),
    )
    if user.recoveryTokenExpires.replace(
        tzinfo=datetime.timezone.utc
    ) < datetime.datetime.now(datetime.timezone.utc):
        logger.warning("Invalid or expired recovery token: %s", data.recovery_token)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expired recovery token.",
        )

    user.password = crypt_ctx.hash(data.new_password)
    user.recoveryToken = None
    user.recoveryTokenExpires = None
    session.commit()
    session.refresh(user)
    logger.info("Password reset successful for user: %s", user.username)
    return {"message": "Password reset successful."}


@router.get("/roles", response_model=list[Role])
async def get_all_roles(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[Role]:
    """Get all roles in the database.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A list of all roles in the database.
    """

    if not await verify_user_permission("roles:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view all roles.",
        )

    # NOTE: Should we include the permissions of each role in the response?
    return [role for role in session.exec(select(Role)).all()]


@router.get("/config/oauth", response_model=dict[str, bool])
async def get_oauth_config() -> dict[str, bool]:
    """Get the OAuth configuration status."""

    return {
        "google": google_oauth_adapter is not None,
        # TODO: The OAuth adapters below are not yet implemented. See adapters/oauth.py
        "microsoft": app_config.authentication.oauth.microsoft is not None,
        "facebook": app_config.authentication.oauth.facebook is not None,
    }


@router.post("/mfa/otp/generate")
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


@router.post("/mfa/otp/verify")
async def verify_mfa_otp(
    token: logged_in_dep,
    otp: str,
    session: Annotated[Session, Depends(get_db_session)],
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
            send_mail(
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


@router.post("/mfa/otp/validate")
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


@router.post("/mfa/otp/disable")
async def disable_mfa_otp(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
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
            send_mail(
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


@router.get("/oauth/google/login")
async def google_oauth_login():
    """Handle Google OAuth login."""
    if google_oauth_adapter is None:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured.",
        )

    return await google_oauth_adapter.get_authorization_url()


@router.get("/oauth/google/callback")
async def google_oauth_callback(
    code: str,
    session: Annotated[Session, Depends(get_db_session)],
    request: Request,
):
    """Handle Google OAuth callback."""

    if google_oauth_adapter is None:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured.",
        )

    result = await oauth_google_authenticate(
        code=code,
        google_oauth_adapter=google_oauth_adapter,
        session=session,
        request=request,
    )

    if result[0] != status.HTTP_200_OK:
        logger.error("Google OAuth authentication failed: %s", result[1])
        raise HTTPException(
            status_code=result[0],
            detail=result[1],
        )

    if isinstance(result[1], JWTToken):
        return result[1]

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unexpected response from Google OAuth authentication.",
    )


@router.get("/oauth/google/link")
async def oauth_link_google(
    code: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Link a Google account for OAuth."""

    if google_oauth_adapter is None:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured.",
        )

    if await oauth_google_link(
        code=code,
        user_id=token.id,
        google_oauth_adapter=google_oauth_adapter,
        session=session,
    ):
        logger.info("Google OAuth linking successful for user: %s", token.id)
        return {"message": "Google account linked successfully."}

    logger.error("Google OAuth linking failed for user: %s", token.id)
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Failed to link Google account. Please try again.",
    )


@router.get("/oauth/google/unlink")
async def oauth_unlink_google(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Unlink a Google account from the user's profile."""

    if google_oauth_adapter is None:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured.",
        )

    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.oauthLinkedGoogleId = None
    session.commit()
    session.refresh(user)

    logger.info("Google OAuth unlinked successfully for user: %s", token.id)
    return {"message": "Google account unlinked successfully."}


@router.get("/oauth/microsoft/login")
async def microsoft_oauth_login():
    """Handle Microsoft OAuth login."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth login is not implemented yet.",
    )


@router.get("/oauth/microsoft/callback")
async def microsoft_oauth_callback():
    """Handle Microsoft OAuth callback."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth callback is not implemented yet.",
    )


@router.get("/oauth/facebook/login")
async def facebook_oauth_login():
    """Handle Facebook OAuth login."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Facebook OAuth login is not implemented yet.",
    )


@router.get("/oauth/facebook/callback")
async def facebook_oauth_callback():
    """Handle Facebook OAuth callback."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Facebook OAuth callback is not implemented yet.",
    )
