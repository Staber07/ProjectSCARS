import ky from "ky";

import { Connections } from "@/lib/info";
import { AccessTokenType } from "@/lib/types";

const endpoint = `${Connections.CentralServer.endpoint}/api/v1`;

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
