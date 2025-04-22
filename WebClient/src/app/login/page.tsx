"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth, AuthProvider } from "@/lib/providers/auth";
import { MainLoginComponent } from "@/components/MainLoginComponent";

/**
 * Wrapper for the entire page to enable the use of the AuthProvider.
 */
export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}

/**
 * Only show the login page if not authenticated.
 *
 * @returns The login page content if not authenticated, otherwise redirects to the home page.
 */
function LoginContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return <MainLoginComponent />;
}
