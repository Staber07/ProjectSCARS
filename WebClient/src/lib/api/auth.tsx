import ky from "ky";

import { Connections, LocalStorage } from "@/lib/info";
import { AccessTokenType, UserPublicType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

function GetAccessTokenHeader(): string {
  const accessToken = localStorage.getItem(LocalStorage.jwt_name);
  const tokenType = localStorage.getItem(LocalStorage.jwt_type);
  if (accessToken === null || tokenType === null) {
    throw new Error("Access token or token type is not set");
  }

  return `${tokenType} ${accessToken}`;
}

/**
 * Log the user in to the central server.
 *
 * username: The username of the user.
 * password: The password of the user.
 *
 * Returns the access token and type of the user.
 */
export async function CentralServerLogInUser(
  username: string,
  password: string,
): Promise<AccessTokenType> {
  const loginFormData = new URLSearchParams();
  loginFormData.set("grant_type", "password");
  loginFormData.set("username", username);
  loginFormData.set("password", password);

  const centralServerResponse = await ky.post(`${endpoint}/auth/token`, {
    body: loginFormData,
  });
  if (!centralServerResponse.ok) {
    throw new Error(
      `Failed to log in: ${centralServerResponse.status} ${centralServerResponse.statusText}`,
    );
  }

  const responseData: AccessTokenType = await centralServerResponse.json();
  return {
    access_token: responseData["access_token"],
    token_type: responseData["token_type"],
  };
}

export async function CentralServerGetUserInfo(
  refresh: boolean = false,
): Promise<UserPublicType> {
  let userData: UserPublicType;
  if (refresh || localStorage.getItem(LocalStorage.user_data) === null) {
    const centralServerResponse = await ky.get(`${endpoint}/users/me`, {
      headers: { Authorization: GetAccessTokenHeader() },
    });
    if (!centralServerResponse.ok) {
      console.error(
        `Failed to log in: ${centralServerResponse.status} ${centralServerResponse.statusText}`,
      );
    }
    userData = await centralServerResponse.json();
    localStorage.setItem(LocalStorage.user_data, JSON.stringify(userData));
  } else {
    const lsContent = localStorage.getItem(LocalStorage.user_data);
    if (lsContent === null) {
      return CentralServerGetUserInfo(true);
    }
    userData = JSON.parse(lsContent);
  }

  return userData;
}
