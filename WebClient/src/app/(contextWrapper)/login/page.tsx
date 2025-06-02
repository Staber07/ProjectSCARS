"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/providers/auth";
import { MainLoginComponent } from "@/components/MainLoginComponent/MainLoginComponent";

export function LoginContent() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    console.debug("Rendering LoginPage", { isAuthenticated });
    useEffect(() => {
        console.debug("LoginContent useEffect started", { isAuthenticated });
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    console.debug("Rendering LoginContent", { isAuthenticated });
    return <MainLoginComponent />;
}

/**
 * Wrapper for the entire page to enable the use of the AuthProvider.
 */
export default function LoginPage() {
    return <LoginContent />;
}
