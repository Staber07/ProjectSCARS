import type { CreateClientConfig } from "./csclient/client.gen";
import { Connections, LocalStorage } from "../info";
import ky, { HTTPError } from "ky";
import { AuthenticationError } from "../error";

// Create a ky instance with base configuration
const kyClient = ky.create({
    prefixUrl: Connections.CentralServer.endpoint,
    timeout: 30000, // 30 seconds timeout
    retry: {
        limit: 3,
        methods: ["get", "put", "head", "delete", "options", "trace"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
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
                    try {
                        // Attempt to refresh token
                        const refreshToken = localStorage.getItem(LocalStorage.refreshToken);
                        if (refreshToken) {
                            const tokenResponse = await ky
                                .post("auth/refresh", {
                                    json: { refreshToken },
                                    prefixUrl: Connections.CentralServer.endpoint,
                                })
                                .json<{ token: string }>();

                            localStorage.setItem(LocalStorage.accessToken, tokenResponse.token);
                            request.headers.set("Authorization", `Bearer ${tokenResponse.token}`);
                        }
                    } catch (refreshError) {
                        console.error("❌ Failed to refresh token:", refreshError);
                        throw new AuthenticationError("Unable to refresh token");
                    }
                }
            },
        ],
    },
});

// Convert ky instance to a fetch-compatible function
// const kyFetch: typeof fetch = async (input, init) => {
//     // Convert fetch input to string URL
//     let url: string;
//     if (typeof input === "string") {
//         url = input;
//     } else if (input instanceof URL) {
//         url = input.toString();
//     } else {
//         // Request object
//         url = input.url;
//     }

//     // Prepare ky options from fetch init
//     const kyOptions: Parameters<typeof ky>[1] = {};

//     if (init) {
//         if (init.method) kyOptions.method = init.method;
//         if (init.headers) kyOptions.headers = init.headers;
//         if (init.body) kyOptions.body = init.body;
//         if (init.signal) kyOptions.signal = init.signal;
//     }

//     // Use ky to make the request
//     return kyInstance(url, kyOptions);
// };

export const createClientConfig: CreateClientConfig = (config) => ({
    ...config,
    baseUrl: Connections.CentralServer.endpoint,
    fetch: kyClient, // Use ky as the fetch implementation
});
