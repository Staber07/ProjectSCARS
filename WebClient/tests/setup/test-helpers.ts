import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Global test setup that runs before all test files
export const setupTests = () => {
    // Mock console methods to reduce noise in test output
    const originalError = console.error;
    const originalWarn = console.warn;

    beforeEach(() => {
        console.error = vi.fn();
        console.warn = vi.fn();
    });

    afterEach(() => {
        console.error = originalError;
        console.warn = originalWarn;
    });
};

// Test environment checks
export const testEnvironmentChecks = () => {
    // Ensure we're in a test environment
    expect(process.env.NODE_ENV).toBe("test");

    // Ensure Vitest globals are available
    expect(vi).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
};

// Common mock data factory
export const createTestData = {
    user: (overrides = {}) => ({
        id: "test-user-id",
        username: "testuser",
        nameFirst: "Test",
        nameMiddle: null,
        nameLast: "User",
        email: "test@example.com",
        position: "Tester",
        ...overrides,
    }),

    token: (overrides = {}) => ({
        access_token: "test-access-token",
        token_type: "bearer",
        expires_in: 3600,
        ...overrides,
    }),

    error: (message = "Test error", overrides = {}) => {
        const error = new Error(message);
        return Object.assign(error, overrides);
    },
};

// Test assertions helpers
export const customMatchers = {
    toBeValidUrl: (received: string) => {
        try {
            new URL(received);
            return {
                message: () => `expected ${received} not to be a valid URL`,
                pass: true,
            };
        } catch {
            return {
                message: () => `expected ${received} to be a valid URL`,
                pass: false,
            };
        }
    },

    toBeValidHexColor: (received: string) => {
        const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
        const isValid = hexColorRegex.test(received);

        return {
            message: () => `expected ${received} ${isValid ? "not " : ""}to be a valid hex color`,
            pass: isValid,
        };
    },
};

// Performance test helpers
export const performanceHelpers = {
    measureRenderTime: async (renderFunction: () => void) => {
        const start = performance.now();
        await renderFunction();
        const end = performance.now();
        return end - start;
    },

    expectFastRender: async (renderFunction: () => void, maxTime = 100) => {
        const renderTime = await performanceHelpers.measureRenderTime(renderFunction);
        expect(renderTime).toBeLessThan(maxTime);
    },
};

export { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
