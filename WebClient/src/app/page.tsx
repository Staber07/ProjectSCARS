"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Text } from "@mantine/core";

import { useAuth, AuthProvider } from "@/lib/providers/auth";

import { LoadingComponent } from "@/components/LoadingComponent";

/**
 * Wrapper for the entire page to enable the use of the AuthProvider.
 */
export default function RootPage() {
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
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to the login page if not authenticated
    }
    else {
      router.push("/Dashboard"); // Redirect to the dashboard if authenticated
    }
  }, [isAuthenticated, router]);

  // if rendering the page for the first time, show loading component
  if (!isAuthenticated) {
    return <LoadingComponent />;
  }

  // TODO: WIP
  return <Text>Welcome! You are successfully authenticated.</Text>;
}
