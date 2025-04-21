"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth, AuthProvider } from "@/lib/providers/auth";
import { LoadingComponent } from "@/components/LoadingComponent";

/// Wrapper for the entire page
// to enable the use of the AuthProvider
export default function RootPage() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}

function RootContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to the login page if not authenticated
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <LoadingComponent />;
  }

  return null;
}
