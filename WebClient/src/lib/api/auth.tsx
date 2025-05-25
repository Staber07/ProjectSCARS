import ky from "ky";

import { Connections, LocalStorage } from "@/lib/info";
import { TokenType, UserPublicType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

export function GetAccessTokenHeader(): string {
    console.debug("Getting access token header");
    const storedToken = localStorage.getItem(LocalStorage.access_token);
    if (storedToken === null) {
        console.error("Access token is not set");
        throw new Error("Access token is not set");
    }

    const accessToken: TokenType = JSON.parse(storedToken);
    return `Bearer ${accessToken.token}`;
}

/**
 * Log the user in to the central server.
 *
 * username: The username of the user.
 * password: The password of the user.
 *
 * Returns the access token and type of the user.
 */
export async function CentralServerLogInUser(username: string, password: string): Promise<TokenType> {
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

export async function CentralServerGetUserInfo(refresh: boolean = false): Promise<UserPublicType> {
    let userData: UserPublicType;
    if (refresh || localStorage.getItem(LocalStorage.user_data) === null) {
        console.debug("Fetching user data from central server");
        const centralServerResponse = await ky.get(`${endpoint}/users/me`, {
            headers: { Authorization: GetAccessTokenHeader() },
        });
        if (!centralServerResponse.ok) {
            const errorMessage = `Failed to log in: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        userData = await centralServerResponse.json();
        localStorage.setItem(LocalStorage.user_data, JSON.stringify(userData));
    } else {
        console.debug("Fetching user data from local storage");
        const lsContent = localStorage.getItem(LocalStorage.user_data);
        if (lsContent === null) {
            console.error("User data is not set. Getting it from the server...");
            return CentralServerGetUserInfo(true);
        }
        userData = JSON.parse(lsContent);
    }

    return userData;
}

export async function CentralServerUpdateUserInfo(newUserInfo: UserPublicType): Promise<UserPublicType> {
    console.debug("Updating user info");
    const centralServerResponse = await ky.put(`${endpoint}/users/me/update`, {
        headers: { Authorization: GetAccessTokenHeader() },
        json: newUserInfo,
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to update user info: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    const updatedUserInfo: UserPublicType = await centralServerResponse.json();
    localStorage.setItem(LocalStorage.user_data, JSON.stringify(updatedUserInfo));
    return updatedUserInfo;
}

export async function CentralServerRequestPasswordRecovery(email: string, username: string): Promise<void> {
    console.debug("Requesting password recovery email for user", { email, username });

    const centralServerResponse = await ky.post(`${endpoint}/auth/recovery/request`, {
        searchParams: {
            username: username,
            email: email,
        },
    });
    if (!centralServerResponse.ok) {
        const errorMessage = `Failed to request password recovery: ${centralServerResponse.status} ${centralServerResponse.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    console.debug("Password recovery request sent successfully");
}
