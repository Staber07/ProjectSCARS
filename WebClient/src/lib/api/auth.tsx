import {
    createNewUserV1AuthCreatePost,
    disableMfaOtpV1AuthMfaOtpDisablePost,
    generateMfaOtpV1AuthMfaOtpGeneratePost,
    getAllRolesV1AuthRolesGet,
    getOauthConfigV1AuthConfigOauthGet,
    getUserProfileEndpointV1UsersMeGet,
    googleOauthCallbackV1AuthOauthGoogleCallbackGet,
    mfaOtpRecoveryV1AuthMfaOtpRecoveryPost,
    oauthLinkGoogleV1AuthOauthGoogleLinkGet,
    oauthUnlinkGoogleV1AuthOauthGoogleUnlinkGet,
    requestAccessTokenV1AuthLoginPost,
    requestPasswordRecoveryV1AuthEmailRecoveryRequestPost,
    requestVerificationEmailV1AuthEmailRequestPost,
    resetPasswordV1AuthEmailRecoveryResetPost,
    validateMfaOtpV1AuthMfaOtpValidatePost,
    verifyEmailV1AuthEmailVerifyPost,
    verifyMfaOtpV1AuthMfaOtpVerifyPost,
    type BodyRequestAccessTokenV1AuthLoginPost,
    type JwtToken,
    type OtpToken,
    type Role,
    type UserPublic,
} from "@/lib/api/csclient";

import { LocalStorage } from "@/lib/info";
import { ServerMessageType } from "@/lib/types";

/**
 * Get the access token header for authenticated requests.
 * @returns {string} The access token header in the format "Bearer <token>".
 */
export function GetAccessTokenHeader(): string {
    console.debug("Getting access token header");
    const storedToken = localStorage.getItem(LocalStorage.accessToken);
    if (storedToken === null) {
        console.error("Access token is not set");
        throw new Error("Access token is not set");
    }

    const accessToken: JwtToken = JSON.parse(storedToken);
    return `Bearer ${accessToken.access_token}`;
}

/**
 * Log the user in to the central server using username and password.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<JwtToken | { [key: string]: string }>} A promise that resolves to the access token or an MFA response if two-factor authentication is required.
 */
export async function LoginUser(username: string, password: string): Promise<JwtToken | { [key: string]: string }> {
    console.debug("Logging in user", { username });

    const loginFormData: BodyRequestAccessTokenV1AuthLoginPost = {
        grant_type: "password",
        username: username,
        password: password,
    };

    try {
        const result = await requestAccessTokenV1AuthLoginPost({
            body: loginFormData,
        });

        if (result.error) {
            const errorMessage = `Failed to log in: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        return result.data as JwtToken | { [key: string]: string };
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}

export async function GenerateTOTP(): Promise<OtpToken> {
    console.debug("Generating TOTP for user");

    try {
        const result = await generateMfaOtpV1AuthMfaOtpGeneratePost({
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to generate TOTP: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("TOTP generated successfully", result.data);
        return result.data as OtpToken;
    } catch (error) {
        console.error("TOTP generation failed:", error);
        throw error;
    }
}

export async function VerifyTOTP(otp: string): Promise<{ message: string }> {
    console.debug("Verifying TOTP for user", { otp });

    try {
        const result = await verifyMfaOtpV1AuthMfaOtpVerifyPost({
            query: { otp: otp },
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to verify TOTP: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("TOTP verified successfully");
        return result.data as { message: string };
    } catch (error) {
        console.error("TOTP verification failed:", error);
        throw error;
    }
}

export async function ValidateTOTP(otp: string, nonce: string): Promise<JwtToken> {
    console.debug("Validating TOTP for user", { otp, nonce });

    try {
        const result = await validateMfaOtpV1AuthMfaOtpValidatePost({
            body: {
                otp: otp,
                nonce: nonce,
            },
        });

        if (result.error) {
            const errorMessage = `Failed to validate TOTP: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        return result.data as JwtToken;
    } catch (error) {
        console.error("TOTP validation failed:", error);
        throw error;
    }
}

export async function DisableTOTP(): Promise<ServerMessageType> {
    console.debug("Disabling TOTP for user");

    try {
        const result = await disableMfaOtpV1AuthMfaOtpDisablePost({
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to disable TOTP: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("TOTP disabled successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("TOTP disable failed:", error);
        throw error;
    }
}

export async function UseOTPRecoveryCode(recoveryCode: string, nonce: string): Promise<JwtToken> {
    console.debug("Using OTP recovery code for user", { recoveryCode, nonce });

    try {
        const result = await mfaOtpRecoveryV1AuthMfaOtpRecoveryPost({
            body: {
                recovery_code: recoveryCode,
                nonce: nonce,
            },
        });

        if (result.error) {
            const errorMessage = `Failed to use OTP recovery code: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        return result.data as JwtToken;
    } catch (error) {
        console.error("OTP recovery failed:", error);
        throw error;
    }
}

/**
 * Fetch the user information from the central server.
 * @return {Promise<UserPublic>} A promise that resolves to the user data.
 */
export async function GetUserInfo(): Promise<[UserPublic, string[]]> {
    try {
        const result = await getUserProfileEndpointV1UsersMeGet({
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to get user info: ${result.response.status} ${result.response.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const [updatedUserInfo, roles] = result.data as [UserPublic, string[]];
        return [updatedUserInfo, roles];
    } catch (error) {
        console.error("Get user info failed:", error);
        throw error;
    }
}

/**
 * Request a password recovery email from the central server.
 * @param {string} email - The email address of the user.
 * @param {string} username - The username of the user.
 * @return {Promise<ServerMessageType>} A promise that resolves to the server message type.
 */
export async function RequestPasswordRecovery(email: string, username: string): Promise<ServerMessageType> {
    console.debug("Requesting password recovery email for user", { email, username });

    try {
        const result = await requestPasswordRecoveryV1AuthEmailRecoveryRequestPost({
            query: {
                username: username,
                email: email,
            },
        });

        if (result.error) {
            const errorMessage = `Failed to request password recovery: ${result.response.status} ${result.response.statusText}`;
            console.error(errorMessage);
            return { message: errorMessage };
        }

        console.debug("Password recovery request sent successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("Password recovery request failed:", error);
        return { message: "Request failed" };
    }
}

/**
 * Reset the user's password using a recovery token received via email.
 * @param {string} token - The recovery token sent to the user's email.
 * @param {string} new_password - The new password to set for the user.
 * @return {Promise<ServerMessageType>} A promise that resolves to the server message type indicating success or failure.
 */
export async function ResetPassword(token: string, new_password: string): Promise<ServerMessageType> {
    console.debug("Resetting password for user with token", { token });

    try {
        const result = await resetPasswordV1AuthEmailRecoveryResetPost({
            body: {
                recovery_token: token,
                new_password: new_password,
            },
        });

        if (result.error) {
            const errorMessage = `Failed to reset password: ${result.response.status} ${result.response.statusText}`;
            console.error(errorMessage);
            return { message: errorMessage };
        }

        console.debug("Password reset successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("Password reset failed:", error);
        return { message: "Reset failed" };
    }
}

/**
 * Fetch all roles from the central server.
 * @return {Promise<Role[]>} A promise that resolves to an array of roles.
 */
export async function GetAllRoles(): Promise<Role[]> {
    try {
        const result = await getAllRolesV1AuthRolesGet({
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to get all roles: ${result.response.status} ${result.response.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        return result.data as Role[];
    } catch (error) {
        console.error("Get all roles failed:", error);
        throw error;
    }
}
export async function RequestVerificationEmail(): Promise<ServerMessageType> {
    console.debug("Requesting verification email for user");

    try {
        const result = await requestVerificationEmailV1AuthEmailRequestPost({
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to request verification email: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("Verification email requested successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("Verification email request failed:", error);
        throw error;
    }
}

export async function VerifyUserEmail(token: string): Promise<ServerMessageType> {
    console.debug("Verifying user email with token", { token });

    try {
        const result = await verifyEmailV1AuthEmailVerifyPost({
            query: { token: token },
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to verify email: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            return { message: errorMessage };
        }

        console.debug("Email verified successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("Email verification failed:", error);
        return { message: "Verification failed" };
    }
}

export async function CreateUser(username: string, roleId: number, password: string): Promise<UserPublic> {
    console.debug("Creating new user", { username, roleId });

    try {
        const result = await createNewUserV1AuthCreatePost({
            headers: { Authorization: GetAccessTokenHeader() },
            body: {
                username: username,
                roleId: roleId,
                password: password,
            },
        });

        if (result.error) {
            const errorMessage = `Failed to create user: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("User created successfully");
        return result.data as UserPublic;
    } catch (error) {
        console.error("User creation failed:", error);
        throw error;
    }
}

export async function OAuthGoogleLink(code: string): Promise<ServerMessageType> {
    console.debug("Linking Google account with code", { code });

    try {
        const result = await oauthLinkGoogleV1AuthOauthGoogleLinkGet({
            query: { code: code },
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to link Google account: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("Google account linked successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("Google link failed:", error);
        throw error;
    }
}

export async function OAuthGoogleUnlink(): Promise<ServerMessageType> {
    console.debug("Unlinking Google account");

    try {
        const result = await oauthUnlinkGoogleV1AuthOauthGoogleUnlinkGet({
            headers: { Authorization: GetAccessTokenHeader() },
        });

        if (result.error) {
            const errorMessage = `Failed to unlink Google account: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("Google account unlinked successfully");
        return result.data as ServerMessageType;
    } catch (error) {
        console.error("Google unlink failed:", error);
        throw error;
    }
}

export async function OAuthGoogleAuthenticate(code: string): Promise<JwtToken> {
    console.debug("Authenticating with Google OAuth", { code });

    try {
        const result = await googleOauthCallbackV1AuthOauthGoogleCallbackGet({
            query: { code: code },
        });

        if (result.error) {
            const errorMessage = `Failed to authenticate with Google: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        console.debug("Google authentication successful");
        return result.data as JwtToken;
    } catch (error) {
        console.error("Google authentication failed:", error);
        throw error;
    }
}

export async function GetOAuthSupport(): Promise<{ google: boolean; microsoft: boolean; facebook: boolean }> {
    console.debug("Getting OAuth support configuration");

    try {
        const result = await getOauthConfigV1AuthConfigOauthGet();

        if (result.error) {
            const errorMessage = `Failed to get OAuth support: ${result.response.status} ${result.response.statusText}`;
            console.error(result.error);
            throw new Error(errorMessage);
        }

        return result.data as { google: boolean; microsoft: boolean; facebook: boolean };
    } catch (error) {
        console.error("Get OAuth support failed:", error);
        throw error;
    }
}
