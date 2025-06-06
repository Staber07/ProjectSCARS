import ky from "ky";

import { Connections, LocalStorage } from "@/lib/info";
import { RoleType, ServerMessageType, TokenType, UserPublicType } from "@/lib/types";

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
    return `Bearer ${accessToken.token}`;
}

/**
 * Log the user in to the central server using username and password.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @return {Promise<TokenType>} A promise that resolves to the access token and token type.
 */
export async function LoginUser(username: string, password: string): Promise<TokenType> {
    const loginFormData = new URLSearchParams();
    loginFormData.set("grant_type", "password");
    loginFormData.set("username", username);
    loginFormData.set("password", password);

    console.debug("Logging in user", { username });
    const centralServerResponse = await ky.post(`${endpoint}/auth/token`, {
        body: loginFormData,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to log in: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const responseData: { access_token: string; token_type: string } = await centralServerResponse.json();
    console.debug("Access and refresh tokens received");
    return {
        token: responseData["access_token"],
        type: responseData["token_type"],
    };
}

/**
 * Fetch the user information from the central server.
 * @return {Promise<UserPublicType>} A promise that resolves to the user data.
 */
export async function GetUserInfo(): Promise<[UserPublicType, string[]]> {
    const centralServerResponse = await ky.get(`${endpoint}/users/me`, {
        headers: { Authorization: GetAccessTokenHeader() },
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

export async function CreateAuthUser(payload: {
  full_name: string;
  email: string;
  password: string;
  username: string;
  assigned_school: string;
  role: string;
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_CENTRAL_SERVER_URL}/auth/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  return await res.json();
}

