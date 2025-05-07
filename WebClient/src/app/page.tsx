"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth, AuthProvider } from "@/lib/providers/auth";

import { LoadingComponent } from "@/components/LoadingComponent";

/**
 * Wrapper for the entire page to enable the use of the AuthProvider.
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
 * Shows the main content of the page if the user is authenticated.
 * Otherwise, redirect user to the login page.
 *
 * @returns The main content of the page.
 */
function RootContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.debug("RootContent useEffect started", { isAuthenticated });
    router.push(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, router]);

  console.debug("Rendering RootContent", { isAuthenticated });
  // Show loading component while navigating
  return <LoadingComponent />;
}
