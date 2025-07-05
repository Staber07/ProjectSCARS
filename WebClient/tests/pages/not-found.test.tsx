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
        button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
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

describe("NotFound page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders 404 error message", () => {
        renderWithProvider(<NotFound />);

        expect(screen.getByText("Page Not Found")).toBeInTheDocument();
        expect(screen.getByText("The page you are looking for does not exist.")).toBeInTheDocument();
    });

    it("renders navigation buttons", () => {
        renderWithProvider(<NotFound />);

        expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
    });

    it("calls router.back when go back button is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<NotFound />);

        const backButton = screen.getByRole("button", { name: /go back/i });
        await user.click(backButton);

        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("navigates to home when go home button is clicked", async () => {
        const user = userEvent.setup();
        renderWithProvider(<NotFound />);

        const homeButton = screen.getByRole("button", { name: /go home/i });
        await user.click(homeButton);

        expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("has proper layout structure", () => {
        renderWithProvider(<NotFound />);

        // Should be centered vertically
        const container = screen.getByText("Page Not Found").closest('[style*="height: 100vh"]');
        expect(container).toBeInTheDocument();
    });
});
