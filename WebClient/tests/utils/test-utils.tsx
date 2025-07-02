import { MantineProvider } from "@mantine/core";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { vi } from "vitest";

// Custom render function that includes providers
export function renderWithMantine(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return <MantineProvider>{children}</MantineProvider>;
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

// Mock router helpers
export const createMockRouter = () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
});

// Mock localStorage helpers
export const createMockLocalStorage = () => {
    const store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            Object.keys(store).forEach((key) => delete store[key]);
        }),
    };
};

// Mock fetch for API tests
export const createMockFetch = (responses: Record<string, unknown> = {}) => {
    return vi.fn((url: string) => {
        const response = responses[url] || { ok: true, json: () => Promise.resolve({}) };
        return Promise.resolve({
            ok: (response as { ok?: boolean }).ok ?? true,
            status: (response as { status?: number }).status || 200,
            json: () =>
                Promise.resolve(
                    (response as { data?: unknown }).data || (response as { json?: () => unknown }).json?.() || {}
                ),
            text: () => Promise.resolve((response as { text?: string }).text || ""),
        });
    });
};

// Common test data
export const mockJwtToken = {
    access_token: "test-access-token",
    token_type: "bearer",
    expires_in: 3600,
};

export const mockJwtTokenWithRefresh = {
    ...mockJwtToken,
    refresh_token: "test-refresh-token",
};

export const mockUser = {
    id: "user-123",
    username: "testuser",
    nameFirst: "John",
    nameMiddle: "Q",
    nameLast: "Doe",
    email: "john.doe@example.com",
    position: "Developer",
};

// Re-export testing library utilities
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
