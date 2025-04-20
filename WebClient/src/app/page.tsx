"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, AuthProvider } from "@/lib/providers/auth";

/// Wrapper for the entire page
// to enable the use of the AuthProvider
export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}

function HomeContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to the login page if not authenticated
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // TODO: WIP
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>WIP :)</h1>
      </main>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"> */}
      {/*   <p>WIP :P</p> */}
      {/* </footer> */}
    </div>
  );
}
