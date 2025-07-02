import { LocalStorage } from "@/lib/info";
import {
    CheckAndHandleMissingTokens,
    GetAccessTokenHeader,
    GetRefreshToken,
    IsAccessTokenMissing,
    IsRememberMeEnabled,
} from "@/lib/utils/token";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the logout utility
vi.mock("@/lib/utils/logout", () => ({
    performLogout: vi.fn(),
}));

// Mock console methods
const mockConsoleDebug = vi.spyOn(console, "debug");
const mockConsoleError = vi.spyOn(console, "error");
const mockConsoleInfo = vi.spyOn(console, "info");

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

describe("Token Utilities", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockClear();
        mockConsoleDebug.mockClear();
        mockConsoleError.mockClear();
        mockConsoleInfo.mockClear();
    });

    afterEach(() => {
        // Don't restore all mocks, just reset them
        mockConsoleDebug.mockReset();
        mockConsoleError.mockReset();
        mockConsoleInfo.mockReset();
    });

    describe("GetAccessTokenHeader", () => {
        it("returns bearer token when valid token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
                refresh_token: "test-refresh-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = GetAccessTokenHeader();

            expect(result).toBe("Bearer test-access-token");
            expect(localStorageMock.getItem).toHaveBeenCalledWith(LocalStorage.accessToken);
        });

        it("throws error when no token exists", () => {
            localStorageMock.getItem.mockReturnValue(null);

            expect(() => GetAccessTokenHeader()).toThrow("Access token is not set");
        });

        it("throws error when token is invalid JSON", () => {
            localStorageMock.getItem.mockReturnValue("invalid-json");

            expect(() => GetAccessTokenHeader()).toThrow();
        });
    });

    describe("IsRememberMeEnabled", () => {
        it("returns true when refresh token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
                refresh_token: "test-refresh-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsRememberMeEnabled();

            expect(result).toBe(true);
        });

        it("returns false when no refresh token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsRememberMeEnabled();

            expect(result).toBe(false);
        });

        it("returns false when no token exists", () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = IsRememberMeEnabled();

            expect(result).toBe(false);
        });

        it("returns false when token is invalid JSON", () => {
            localStorageMock.getItem.mockReturnValue("invalid-json");

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
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = GetRefreshToken();

            expect(result).toBe("test-refresh-token");
        });

        it("returns null when no refresh token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = GetRefreshToken();

            expect(result).toBeNull();
        });

        it("returns null when no token exists", () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = GetRefreshToken();

            expect(result).toBeNull();
        });

        it("returns null when token is invalid JSON", () => {
            localStorageMock.getItem.mockReturnValue("invalid-json");

            const result = GetRefreshToken();

            expect(result).toBeNull();
        });
    });

    describe("IsAccessTokenMissing", () => {
        it("returns false when valid token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsAccessTokenMissing();

            expect(result).toBe(false);
        });

        it("returns true when no token exists", () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = IsAccessTokenMissing();

            expect(result).toBe(true);
        });

        it("returns true when token has no access_token property", () => {
            const mockToken = {
                refresh_token: "test-refresh-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            const result = IsAccessTokenMissing();

            expect(result).toBe(true);
        });

        it("returns true when token is invalid JSON", () => {
            localStorageMock.getItem.mockReturnValue("invalid-json");

            const result = IsAccessTokenMissing();

            expect(result).toBe(true);
        });
    });

    describe("CheckAndHandleMissingTokens", () => {
        const mockLogoutCallback = vi.fn();

        beforeEach(() => {
            mockLogoutCallback.mockClear();
        });

        it("calls logout when no token exists", () => {
            localStorageMock.getItem.mockReturnValue(null);

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).toHaveBeenCalledTimes(1);
        });

        it("calls logout when token has no access_token", () => {
            const mockToken = {
                refresh_token: "test-refresh-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).toHaveBeenCalledTimes(1);
        });

        it("does not call logout when valid token exists", () => {
            const mockToken = {
                access_token: "test-access-token",
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockToken));

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).not.toHaveBeenCalled();
        });

        it("calls logout when token is invalid JSON", () => {
            localStorageMock.getItem.mockReturnValue("invalid-json");

            CheckAndHandleMissingTokens(mockLogoutCallback);

            expect(mockLogoutCallback).toHaveBeenCalledTimes(1);
        });
    });
});
