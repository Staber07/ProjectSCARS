import RootPage from "@/app/page";
import { MantineProvider } from "@mantine/core";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the LoadingComponent
vi.mock("@/components/LoadingComponent/LoadingComponent", () => ({
    LoadingComponent: ({ withBorder }: { withBorder: boolean }) => (
        <div data-testid="loading-component" data-with-border={withBorder}>
            Loading...
        </div>
    ),
}));

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),
}));

const renderWithProvider = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
};

describe("RootPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading component", () => {
        const { getByTestId } = renderWithProvider(<RootPage />);

        const loadingComponent = getByTestId("loading-component");
        expect(loadingComponent).toBeInTheDocument();
        expect(loadingComponent).toHaveAttribute("data-with-border", "false");
    });

    it("redirects to login page on mount", () => {
        renderWithProvider(<RootPage />);

        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    it("only calls redirect once", () => {
        renderWithProvider(<RootPage />);

        expect(mockReplace).toHaveBeenCalledTimes(1);
    });
});
