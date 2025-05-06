"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { AuthProvider, useAuth } from "@/lib/providers/auth";
import { Navbar } from "@/components/Navbar";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.debug("Rendering LoggedInLayout");
  return (
    <AuthProvider>
      <LoggedInContent>{children}</LoggedInContent>
    </AuthProvider>
  );
}

function LoggedInContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [opened] = useDisclosure();

  useEffect(() => {
    console.debug("LoggedInContent useEffect started", { isAuthenticated });
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  console.debug("Rendering LoggedInContent", { isAuthenticated });
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
