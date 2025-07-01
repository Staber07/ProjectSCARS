import { ErrorComponent } from "@/components/ErrorComponent";
import { MantineProvider } from "@mantine/core";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
    }),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
        button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
            <button {...props}>{children}</button>
        ),
    },
}));

// Mock animation config
vi.mock("@/lib/anim", () => ({
    animationConfig: {
        button: {
            transition: {},
            whileHover: {},
            whileTap: {},
        },
    },
}));

const renderWithProvider = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
};

describe("ErrorComponent", () => {
    const mockReset = vi.fn();
    const mockError = new Error("Test error message");

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders error message", () => {
        renderWithProvider(<ErrorComponent error={mockError} reset={mockReset} />);

        expect(screen.getByText("Uh oh!")).toBeInTheDocument();
        expect(screen.getByText("Test error message")).toBeInTheDocument();
        expect(screen.getByText(/An unexpected error occurred:/)).toBeInTheDocument();
    });

    it("renders error digest when provided", () => {
        const errorWithDigest = Object.assign(mockError, { digest: "abc123" });
        renderWithProvider(<ErrorComponent error={errorWithDigest} reset={mockReset} />);

        expect(screen.getByText(/Error digest:/)).toBeInTheDocument();
        expect(screen.getByText("abc123")).toBeInTheDocument();
    });

    it("does not render error digest when not provided", () => {
        const errorWithoutDigest = new Error("Test error message");
        renderWithProvider(<ErrorComponent error={errorWithoutDigest} reset={mockReset} />);

        expect(screen.queryByText(/Error digest:/)).not.toBeInTheDocument();
    });

    it("calls reset function when try again button is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<ErrorComponent error={mockError} reset={mockReset} />);

        const tryAgainButton = screen.getByRole("button", { name: /try again/i });
        await user.click(tryAgainButton);

        expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("navigates back when back button is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<ErrorComponent error={mockError} reset={mockReset} />);

        const backButton = screen.getByRole("button", { name: /go back/i });
        await user.click(backButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("displays contact support message", () => {
        renderWithProvider(<ErrorComponent error={mockError} reset={mockReset} />);

        expect(screen.getByText(/Please try again later or contact support/)).toBeInTheDocument();
    });
});
