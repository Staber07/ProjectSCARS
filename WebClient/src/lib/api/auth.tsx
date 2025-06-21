import ky from "ky";

import { Connections, LocalStorage } from "@/lib/info";
import { OTPGenDataType, OTPNonceType, RoleType, ServerMessageType, TokenType, UserPublicType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

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

    const accessToken: TokenType = JSON.parse(storedToken);
    return `Bearer ${accessToken.access_token}`;
}

/**
 * Log the user in to the central server using username and password.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<TokenType | OTPNonceType>} A promise that resolves to the access token and token type or an OTP nonce type if two-factor authentication is required.
 */
export async function LoginUser(username: string, password: string): Promise<TokenType | OTPNonceType> {
    const loginFormData = new URLSearchParams();
    loginFormData.set("grant_type", "password");
    loginFormData.set("username", username);
    loginFormData.set("password", password);

    console.debug("Logging in user", { username });
    const centralServerResponse = await ky.post(`${endpoint}/auth/login`, {
        body: loginFormData,
        throwHttpErrors: false,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to log in: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        console.error(errorResponse?.detail || errorMessage);
        throw new Error(errorResponse?.detail || errorMessage);
    }

    const responseData: TokenType | OTPNonceType = await centralServerResponse.json();
    return responseData;
}

export async function GenerateTOTP(): Promise<OTPGenDataType> {
    console.debug("Generating TOTP for user");
    const centralServerResponse = await ky.post(`${endpoint}/auth/mfa/otp/generate`, {
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to generate TOTP: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        console.error(errorResponse?.detail || errorMessage);
        throw new Error(errorResponse?.detail || errorMessage);
    }

    const responseData: OTPGenDataType = await centralServerResponse.json();
    console.debug("TOTP generated successfully", responseData);
    return responseData;
}

export async function VerifyTOTP(otp: string): Promise<{ message: string }> {
    console.debug("Verifying TOTP for user", { otp });
    const centralServerResponse = await ky.post(`${endpoint}/auth/mfa/otp/verify`, {
        searchParams: { otp: otp },
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to verify TOTP: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        console.error(errorResponse?.detail || errorMessage);
        throw new Error(errorResponse?.detail || errorMessage);
    }

    const responseData: { message: string } = await centralServerResponse.json();
    console.debug("TOTP verified successfully");
    return responseData;
}

export async function ValidateTOTP(otp: string, nonce: string): Promise<TokenType> {
    console.debug("Validating TOTP for user", { otp, nonce });
    const centralServerResponse = await ky.post(`${endpoint}/auth/mfa/otp/validate`, {
        json: {
            otp: otp,
            nonce: nonce,
        },
        throwHttpErrors: false,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to validate TOTP: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        console.error(errorResponse?.detail || errorMessage);
        throw new Error(errorResponse?.detail || errorMessage);
    }

    const responseData: TokenType = await centralServerResponse.json();
    return responseData;
}

export async function DisableTOTP(): Promise<ServerMessageType> {
    console.debug("Disabling TOTP for user");
    const centralServerResponse = await ky.post(`${endpoint}/auth/mfa/otp/disable`, {
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to disable TOTP: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        console.error(errorResponse?.detail || errorMessage);
        throw new Error(errorResponse?.detail || errorMessage);
    }
    console.debug("TOTP disabled successfully");
    const result: ServerMessageType = await centralServerResponse.json();
    return result;
}

/**
 * Fetch the user information from the central server.
 * @return {Promise<UserPublicType>} A promise that resolves to the user data.
 */
export async function GetUserInfo(): Promise<[UserPublicType, string[]]> {
    const centralServerResponse = await ky.get(`${endpoint}/users/me`, {
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to log in: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const [updatedUserInfo, roles]: [UserPublicType, string[]] = await centralServerResponse.json();
    return [updatedUserInfo, roles];
}

/**
 * Request a password recovery email from the central server.
 * @param {string} email - The email address of the user.
 * @param {string} username - The username of the user.
 * @return {Promise<ServerMessageType>} A promise that resolves to the server message type.
 */
export async function RequestPasswordRecovery(email: string, username: string): Promise<ServerMessageType> {
    console.debug("Requesting password recovery email for user", { email, username });
    const centralServerResponse = await ky.post(`${endpoint}/auth/recovery/request`, {
        searchParams: {
            username: username,
            email: email,
        },
        throwHttpErrors: false,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to request password recovery: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        return { message: errorResponse?.detail || errorMessage };
    }
    console.debug("Password recovery request sent successfully");
    const result: ServerMessageType = await centralServerResponse.json();
    return result;
}

/**
 * Reset the user's password using a recovery token received via email.
 * @param {string} token - The recovery token sent to the user's email.
 * @param {string} new_password - The new password to set for the user.
 * @return {Promise<ServerMessageType>} A promise that resolves to the server message type indicating success or failure.
 */
export async function ResetPassword(token: string, new_password: string): Promise<ServerMessageType> {
    console.debug("Resetting password for user with token", { token });
    const centralServerResponse = await ky.post(`${endpoint}/auth/recovery/reset`, {
        json: {
            recovery_token: token,
            new_password: new_password,
        },
        throwHttpErrors: false,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to reset password: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        return { message: errorResponse?.detail || errorMessage };
    }
    console.debug("Password reset successfully");
    const result: ServerMessageType = await centralServerResponse.json();
    return result;
}

/**
 * Fetch all roles from the central server.
 * @return {Promise<RoleType[]>} A promise that resolves to an array of roles.
 */
export async function GetAllRoles(): Promise<RoleType[]> {
    const centralServerResponse = await ky.get(`${endpoint}/auth/roles`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });

    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to get all roles: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    const roles: RoleType[] = await centralServerResponse.json();
    return roles;
}
export async function RequestVerificationEmail(): Promise<ServerMessageType> {
    const centralServerResponse = await ky.post(`${endpoint}/auth/email/request`, {
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to request verification email: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    console.debug("Verification email requested successfully");
    return await centralServerResponse.json();
}

export async function VerifyUserEmail(token: string): Promise<ServerMessageType> {
    console.debug("Verifying user email with token", { token });
    const centralServerResponse = await ky.post(`${endpoint}/auth/email/verify`, {
        searchParams: { token: token },
        headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to verify email: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await centralServerResponse.json()) as { detail?: string };
        return { message: errorResponse?.detail || errorMessage };
    }
    console.debug("Email verified successfully");
    return await centralServerResponse.json();
}

export async function CreateUser(username: string, roleId: number, password: string): Promise<UserPublicType> {
    const res = await ky.post(`${endpoint}/auth/create`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: {
            username: username,
            roleId: roleId,
            password: password,
        },
        throwHttpErrors: false,
    });

    if (!res.ok) {
        const errorMessage = `Failed to create user: ${res.status} ${res.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await res.json()) as { detail?: string };
        throw new Error(errorResponse?.detail || errorMessage);
    }

    return await res.json();
}

export async function OAuthGoogleLink(code: string): Promise<ServerMessageType> {
    const res = await ky.get(`${endpoint}/auth/oauth/google/link`, {
        searchParams: { code: code },
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });

    if (!res.ok) {
        const errorMessage = `Failed to link Google account: ${res.status} ${res.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await res.json()) as { detail?: string };
        throw new Error(errorResponse?.detail || errorMessage);
    }

    console.debug("Google account linked successfully");
    return await res.json();
}

export async function OAuthGoogleUnlink(): Promise<ServerMessageType> {
    const res = await ky.get(`${endpoint}/auth/oauth/google/unlink`, {
        headers: { Authorization: GetAccessTokenHeader() },
        throwHttpErrors: false,
    });

    if (!res.ok) {
        const errorMessage = `Failed to unlink Google account: ${res.status} ${res.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await res.json()) as { detail?: string };
        throw new Error(errorResponse?.detail || errorMessage);
    }
    console.debug("Google account unlinked successfully");
    return await res.json();
}

export async function OAuthGoogleAuthenticate(code: string): Promise<TokenType> {
    const res = await ky.get(`${endpoint}/auth/oauth/google/callback`, {
        searchParams: { code: code },
        throwHttpErrors: false,
    });

    if (!res.ok) {
        const errorMessage = `Failed to authenticate with Google: ${res.status} ${res.statusText}`;
        console.error(errorMessage);
        const errorResponse = (await res.json()) as { detail?: string };
        throw new Error(errorResponse?.detail || errorMessage);
    }

    const responseData: { access_token: string; token_type: string } = await res.json();
    return {
        access_token: responseData["access_token"],
        token_type: responseData["token_type"],
    };
}

export async function GetOAuthSupport(): Promise<{ google: boolean; microsoft: boolean; facebook: boolean }> {
    const res = await ky.get(`${endpoint}/auth/config/oauth`);
    if (!res.ok) {
        const errorMessage = `Failed to get OAuth support: ${res.status} ${res.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return (await res.json()) as { google: boolean; microsoft: boolean; facebook: boolean };
}
