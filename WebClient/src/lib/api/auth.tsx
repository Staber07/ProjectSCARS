import ky from "ky";

import { Connections, LocalStorage } from "@/lib/info";
import { TokenType, UserPublicType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

function GetAccessTokenHeader(): string {
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
export async function CentralServerLogInUser(
  username: string,
  password: string,
): Promise<TokenType[]> {
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

  const responseData: TokenType[] = await centralServerResponse.json();
  console.debug("Access and refresh tokens received");
  return [
    {
      token: responseData[0]["token"],
      type: responseData[0]["type"],
    },
    {
      token: responseData[1]["token"],
      type: responseData[1]["type"],
    },
  ];
}

export async function CentralServerGetUserInfo(
  refresh: boolean = false,
): Promise<UserPublicType> {
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
