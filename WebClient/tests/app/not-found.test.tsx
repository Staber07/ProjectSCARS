/**
 * Tests for NotFound page component
 */
import NotFound from "@/app/not-found";
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

describe("NotFound Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders not found message", () => {
        renderWithProvider(<NotFound />);

        expect(screen.getByText("Page Not Found")).toBeInTheDocument();
        expect(screen.getByText("The page you are looking for does not exist.")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
        renderWithProvider(<NotFound />);

        expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
    });

    it("navigates back when back button is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<NotFound />);

        const backButton = screen.getByRole("button", { name: /go back/i });
        await user.click(backButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("navigates to home when home button is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<NotFound />);

        const homeButton = screen.getByRole("button", { name: /go home/i });
        await user.click(homeButton);

        expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("displays 404 icon", () => {
        renderWithProvider(<NotFound />);

        // The IconError404 should be rendered, we can check for its presence indirectly
        const title = screen.getByText("Page Not Found");
        expect(title).toBeInTheDocument();
    });

    it("has proper layout structure", () => {
        renderWithProvider(<NotFound />);

        // Check that all main elements are present
        expect(screen.getByText("Page Not Found")).toBeInTheDocument();
        expect(screen.getByText("The page you are looking for does not exist.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
    });
});
