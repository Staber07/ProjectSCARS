"use client";

import { LoadingComponent } from "@/components/LoadingComponent";
import { AuthProvider, useAuth } from "@/lib/providers/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Root page component.
 * @returns {JSX.Element} The rendered component.
 */
export default function RootPage() {
    console.debug("Rendering RootPage");
    return (
        <AuthProvider>
            <RootContent />
        </AuthProvider>
    );
}

/**
 * RootContent component that performs the authentication check and redirects.
 * @returns {JSX.Element} The rendered component.
 */
function RootContent() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        router.replace(isAuthenticated ? "/dashboard" : "/login");
    }, [isAuthenticated, router]);

    console.debug("Rendering RootContent", { isAuthenticated });
    return <LoadingComponent withBorder={false} />;
}
