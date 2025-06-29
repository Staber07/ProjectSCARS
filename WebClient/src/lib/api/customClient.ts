import ky, { HTTPError } from "ky";
import { AuthenticationError } from "../error";
import { Connections, LocalStorage } from "../info";
import { performLogout } from "../utils/logout";
import { GetRefreshToken } from "../utils/token";
import { JwtToken } from "./csclient";
import type { CreateClientConfig } from "./csclient/client.gen";

// Create a simple ky instance for token refresh (without retry logic to avoid circular dependencies)
const tokenRefreshClient = ky.create({
    prefixUrl: Connections.CentralServer.endpoint,
    timeout: 10000, // 10 seconds timeout for token refresh
    retry: 0, // No retries for token refresh to avoid circular dependencies
});

// Create a ky instance with base configuration
const kyClient = ky.create({
    prefixUrl: Connections.CentralServer.endpoint,
    timeout: 30000, // 30 seconds timeout
    retry: {
        limit: 3,
        methods: ["get", "post", "put", "head", "delete", "options", "trace"],
        statusCodes: [401, 408, 413, 429, 500, 502, 503, 504],
    },
    hooks: {
        beforeRequest: [
            (request) => {
                // Add any global headers or authentication here
                console.log(`🚀 Making request to: ${request.url}`);
            },
        ],
        afterResponse: [
            (request, options, response) => {
                // Log successful responses
                console.log(`✅ Request to ${request.url} completed with status: ${response.status}`);
            },
        ],
        beforeError: [
            (error) => {
                // Log errors with more context
                console.error(`❌ Request failed:`, error);
                return error;
            },
        ],
        beforeRetry: [
            async ({ request, error, retryCount }) => {
                console.log(`🔄 Retrying request (attempt ${retryCount + 1}):`, request.url);

                // Handle token refresh on 401 errors
                if (error instanceof HTTPError && error.response.status === 401) {
                    // if (retryCount > 0) {
                    //     console.warn("🚫 Multiple 401 errors, stopping retry attempts");
                    //     performLogout(true);
                    //     throw new AuthenticationError("Multiple authentication failures - user logged out");
                    // }

                    try {
                        console.warn("🔑 Unauthorized request, attempting to refresh token...");
                        // Attempt to refresh token using the proper utility function
                        const refreshToken = GetRefreshToken();
                        if (!refreshToken) {
                            console.warn("🚪 No refresh token available, logging out user...");
                            performLogout(true); // Redirect to login page
                            throw new AuthenticationError("No refresh token available - user logged out");
                        }

                        console.debug("🔄 Found refresh token, calling refresh endpoint...");
                        const tokenResponse = await tokenRefreshClient
                            .post("v1/auth/refresh", {
                                json: { refresh_token: refreshToken },
                            })
                            .json<JwtToken>();

                        localStorage.setItem(LocalStorage.accessToken, JSON.stringify(tokenResponse));
                        request.headers.set("Authorization", `Bearer ${tokenResponse.access_token}`);

                        console.log("✅ Token refreshed successfully, retrying original request");
                    } catch (refreshError) {
                        console.error("❌ Failed to refresh token:", refreshError);
                        console.warn("🚪 Token refresh failed, logging out user...");
                        performLogout(true); // Redirect to login page
                        throw new AuthenticationError("Token refresh failed - user logged out");
                    }
                }
            },
        ],
    },
});

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: Connections.CentralServer.endpoint,
    fetch: kyClient, // Use ky as the fetch implementation
});
