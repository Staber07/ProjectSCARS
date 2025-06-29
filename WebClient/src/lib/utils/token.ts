import { JwtToken } from "@/lib/api/csclient";
import { LocalStorage } from "@/lib/info";

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
 * Check if user has "Remember Me" enabled by checking for refresh token in the stored JWT
 * @returns {boolean} Whether remember me is enabled
 */
export function IsRememberMeEnabled(): boolean {
    try {
        const storedToken = localStorage.getItem(LocalStorage.accessToken);
        if (!storedToken) return false;

        const token: JwtToken = JSON.parse(storedToken);
        return !!token.refresh_token;
    } catch (error) {
        console.error("Error checking remember me status:", error);
        return false;
    }
}

/**
 * Get the stored refresh token from the JWT token object
 * @returns {string | null} The refresh token or null if not available
 */
export function GetRefreshToken(): string | null {
    try {
        const storedToken = localStorage.getItem(LocalStorage.accessToken);
        if (!storedToken) return null;

        const token: JwtToken = JSON.parse(storedToken);
        return token.refresh_token || null;
    } catch (error) {
        console.error("Error getting refresh token:", error);
        return null;
    }
}

/**
 * Clear all authentication tokens
 */
export function ClearAuthTokens(): void {
    localStorage.removeItem(LocalStorage.accessToken);
}

/**
 * Check if access token is expired (basic JWT decode without verification)
 * @returns {boolean} Whether the token appears to be expired
 */
export function IsAccessTokenExpired(): boolean {
    try {
        const storedToken = localStorage.getItem(LocalStorage.accessToken);
        if (!storedToken) return true;

        const token: JwtToken = JSON.parse(storedToken);
        if (!token.access_token) return true;

        // Basic JWT payload extraction (without verification)
        const parts = token.access_token.split(".");
        if (parts.length !== 3) return true;

        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false; // If no expiry, assume valid

        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error("Error checking token expiration:", error);
        return true; // Assume expired if we can't parse
    }
}

/**
 * Auto-logout functionality for when tokens expire
 * This can be called periodically to check token validity
 * @param logoutCallback - Function to call when auto-logout is needed
 */
export function CheckAndHandleTokenExpiry(logoutCallback: () => void): void {
    if (IsAccessTokenExpired()) {
        const refreshToken = GetRefreshToken();
        if (!refreshToken) {
            console.info("Access token expired and no refresh token available. Logging out.");
            logoutCallback();
        } else {
            console.info("Access token expired but refresh token available. Manual login required.");
            // In a real implementation, you would call a refresh endpoint here
            // For now, we'll just log the user out since there's no refresh endpoint
            logoutCallback();
        }
    }
}
