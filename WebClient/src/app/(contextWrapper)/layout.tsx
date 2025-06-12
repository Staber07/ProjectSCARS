"use client";

import { AuthProvider } from "@/lib/providers/auth";
import { UserProvider } from "@/lib/providers/user";

/**
 * ContextWrapperLayout component that wraps the application in context providers.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the layout.
 * * @returns {JSX.Element} The rendered ContextWrapperLayout component.
 */
export default function ContextWrapperLayout({ children }: { children: React.ReactNode }) {
    console.debug("Rendering ContextWrapperLayout");
    return (
        <UserProvider>
            <AuthProvider>{children}</AuthProvider>
        </UserProvider>
    );
}
