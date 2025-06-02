"use client";

import { Navbar } from "@/components/Navbar";
import { GetUserInfo } from "@/lib/api/auth";
import { AuthProvider, useAuth } from "@/lib/providers/auth";
import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Layout component for logged-in users.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the layout.
 */
export default function LoggedInLayout({ children }: { children: React.ReactNode }) {
    console.debug("Rendering LoggedInLayout");
    return (
        <AuthProvider>
            <LoggedInContent>{children}</LoggedInContent>
        </AuthProvider>
    );
}

/**
 * LoggedInContent component that wraps the main content for logged-in users.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the content area.
 */
function LoggedInContent({ children }: { children: React.ReactNode }) {
    const [userRole, setUserRole] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();
    const [opened] = useDisclosure();
    const router = useRouter();

    useEffect(() => {
        console.debug("LoggedInContent useEffect started", { isAuthenticated });
        const fetchUserInfo = async () => {
            console.debug("Fetching user information");
            const userInfo = await GetUserInfo();
            setUserRole(userInfo.roleId);
        };
        if (!isAuthenticated) {
            router.push("/");
        }
        fetchUserInfo();
    }, [isAuthenticated, router]);

    console.debug("Rendering LoggedInContent", { isAuthenticated });
    return (
        <AppShell
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
