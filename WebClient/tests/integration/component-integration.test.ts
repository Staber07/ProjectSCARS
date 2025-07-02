import { Connections, LocalStorage, Program } from "@/lib/info";
import { GetAccessTokenHeader, IsAccessTokenMissing, IsRememberMeEnabled } from "@/lib/utils/token";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockJwtToken, mockJwtTokenWithRefresh } from "../utils/test-utils";

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

describe("Component Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Authentication flow integration", () => {
        it("handles complete login flow with remember me", () => {
            // Simulate storing token with refresh token (remember me enabled)
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockJwtTokenWithRefresh));

            // Check that all token utilities work correctly together
            expect(IsAccessTokenMissing()).toBe(false);
            expect(IsRememberMeEnabled()).toBe(true);
            expect(GetAccessTokenHeader()).toBe(`Bearer ${mockJwtTokenWithRefresh.access_token}`);
        });

        it("handles login flow without remember me", () => {
            // Simulate storing token without refresh token
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockJwtToken));

            expect(IsAccessTokenMissing()).toBe(false);
            expect(IsRememberMeEnabled()).toBe(false);
            expect(GetAccessTokenHeader()).toBe(`Bearer ${mockJwtToken.access_token}`);
        });

        it("handles logout state", () => {
            // Simulate no token stored
            mockLocalStorage.getItem.mockReturnValue(null);

            expect(IsAccessTokenMissing()).toBe(true);
            expect(IsRememberMeEnabled()).toBe(false);
            expect(() => GetAccessTokenHeader()).toThrow("Access token is not set");
        });

        it("handles corrupted token data", () => {
            // Simulate corrupted localStorage data
            mockLocalStorage.getItem.mockReturnValue("invalid-json-data");

            expect(IsAccessTokenMissing()).toBe(true);
            expect(IsRememberMeEnabled()).toBe(false);
            expect(() => GetAccessTokenHeader()).toThrow();
        });
    });

    describe("Error boundary integration", () => {
        it("error component and token utilities work together", () => {
            // Simulate error state with missing token
            mockLocalStorage.getItem.mockReturnValue(null);

            const isTokenMissing = IsAccessTokenMissing();
            expect(isTokenMissing).toBe(true);

            // This simulates what would happen in an error boundary
            // when authentication fails
            let authError;
            try {
                GetAccessTokenHeader();
            } catch (error) {
                authError = error;
            }

            expect(authError).toBeInstanceOf(Error);
            expect((authError as Error).message).toBe("Access token is not set");
        });
    });

    describe("LocalStorage key consistency", () => {
        it("uses consistent keys across all utilities", () => {
            const expectedKey = LocalStorage.accessToken;

            // Test that all token utilities use the same localStorage key
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockJwtToken));

            GetAccessTokenHeader();
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(expectedKey);

            vi.clearAllMocks();

            IsRememberMeEnabled();
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(expectedKey);

            vi.clearAllMocks();

            IsAccessTokenMissing();
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(expectedKey);
        });
    });

    describe("Configuration integration", () => {
        it("program info has consistent structure", () => {
            // Verify all info exports are properly structured
            expect(Program).toMatchObject({
                name: expect.any(String),
                description: expect.any(String),
                version: expect.any(String),
            });

            expect(Connections.CentralServer).toMatchObject({
                endpoint: expect.any(String),
            });

            expect(LocalStorage).toMatchObject({
                accessToken: expect.any(String),
                userData: expect.any(String),
                userPermissions: expect.any(String),
                userAvatar: expect.any(String),
                userPreferences: expect.any(String),
                setupCompleteDismissed: expect.any(String),
            });
        });
    });
});
