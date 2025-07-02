import { LocalStorage } from "@/lib/info";
import {
    CheckAndHandleMissingTokens,
    GetAccessTokenHeader,
    GetRefreshToken,
    IsAccessTokenMissing,
    IsRememberMeEnabled,
} from "@/lib/utils/token";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
});

// Mock the logout utility
vi.mock("@/lib/utils/logout", () => ({
    performLogout: vi.fn(),
}));

// Mock console methods to avoid noise in tests
vi.spyOn(console, "debug").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "info").mockImplementation(() => {});

describe("Token utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GetAccessTokenHeader", () => {
        it("returns bearer token header when token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
                token_type: "bearer",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = GetAccessTokenHeader();

            expect(result).toBe("Bearer test-access-token");
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(LocalStorage.accessToken);
        });

        it("throws error when no token is stored", () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            expect(() => GetAccessTokenHeader()).toThrow("Access token is not set");
        });

        it("handles malformed JSON gracefully", () => {
            mockLocalStorage.getItem.mockReturnValue("invalid-json");

            expect(() => GetAccessTokenHeader()).toThrow();
        });
    });

    describe("IsRememberMeEnabled", () => {
        it("returns true when refresh token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
                refresh_token: "test-refresh-token",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsRememberMeEnabled();

            expect(result).toBe(true);
        });

        it("returns false when refresh token does not exist", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsRememberMeEnabled();

            expect(result).toBe(false);
        });

        it("returns false when no token is stored", () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = IsRememberMeEnabled();

            expect(result).toBe(false);
        });

        it("returns false when JSON parsing fails", () => {
            mockLocalStorage.getItem.mockReturnValue("invalid-json");

            const result = IsRememberMeEnabled();

            expect(result).toBe(false);
        });
    });

    describe("GetRefreshToken", () => {
        it("returns refresh token when it exists", () => {
            const mockToken = {
                access_token: "test-access-token",
                refresh_token: "test-refresh-token",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = GetRefreshToken();

            expect(result).toBe("test-refresh-token");
        });

        it("returns null when refresh token does not exist", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = GetRefreshToken();

            expect(result).toBe(null);
        });

        it("returns null when no token is stored", () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = GetRefreshToken();

            expect(result).toBe(null);
        });

        it("returns null when JSON parsing fails", () => {
            mockLocalStorage.getItem.mockReturnValue("invalid-json");

            const result = GetRefreshToken();

            expect(result).toBe(null);
        });
    });

    describe("IsAccessTokenMissing", () => {
        it("returns false when valid token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsAccessTokenMissing();

            expect(result).toBe(false);
        });

        it("returns true when no token is stored", () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const result = IsAccessTokenMissing();

            expect(result).toBe(true);
        });

        it("returns true when access_token property is missing", () => {
            const mockToken = {
                token_type: "bearer",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsAccessTokenMissing();

            expect(result).toBe(true);
        });

        it("returns true when JSON parsing fails", () => {
            mockLocalStorage.getItem.mockReturnValue("invalid-json");

            const result = IsAccessTokenMissing();

            expect(result).toBe(true);
        });
    });

    describe("CheckAndHandleMissingTokens", () => {
        const mockLogoutCallback = vi.fn();

        beforeEach(() => {
            mockLogoutCallback.mockClear();
        });

        it("calls logout callback when no token is stored", () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).toHaveBeenCalledTimes(1);
        });

        it("calls logout callback when access_token is missing", () => {
            const mockToken = {
                token_type: "bearer",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).toHaveBeenCalledTimes(1);
        });

        it("does not call logout callback when valid token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockToken));

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).not.toHaveBeenCalled();
        });

        it("calls logout callback when JSON parsing fails", () => {
            mockLocalStorage.getItem.mockReturnValue("invalid-json");

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).toHaveBeenCalledTimes(1);
        });
    });
});
