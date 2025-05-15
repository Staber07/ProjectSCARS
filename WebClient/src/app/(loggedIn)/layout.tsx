"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { AuthProvider, useAuth } from "@/lib/providers/auth";
import { Navbar } from "@/components/Navbar";
import { CentralServerGetUserInfo } from "@/lib/api/auth";

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
    const [userRole, setUserRole] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [opened] = useDisclosure();
    const fetchUserRole = async () => {
        setUserRole((await CentralServerGetUserInfo())?.roleId);
    };

    useEffect(() => {
        console.debug("LoggedInContent useEffect started", { isAuthenticated });
        if (!isAuthenticated) {
            router.push("/");
        }
        fetchUserRole();
    }, [isAuthenticated, router]);

    console.debug("Rendering LoggedInContent", { isAuthenticated });
    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 325,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Navbar p="md">
                <ScrollArea scrollbars="y">
                    <Navbar enableAdminButtons={userRole === 1 || userRole === 2} />
                </ScrollArea>
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
