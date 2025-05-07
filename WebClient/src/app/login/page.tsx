"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth, AuthProvider } from "@/lib/providers/auth";
import { MainLoginComponent } from "@/components/MainLoginComponent";
import { useMantineTheme } from "@mantine/core";

/**
 * Wrapper for the entire page to enable the use of the AuthProvider.
 */
export default function LoginPage() {

  const theme = useMantineTheme();

  console.debug("Rendering LoginPage");
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
    console.debug("LoginContent useEffect started", { isAuthenticated });
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  console.debug("Rendering LoginContent", { isAuthenticated });
  return <MainLoginComponent />;
}
