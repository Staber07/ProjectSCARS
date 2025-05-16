"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { OnboardingTour, OnboardingTourStep } from '@gfazioli/mantine-onboarding-tour';

import { AuthProvider, useAuth } from "@/lib/providers/auth";
import { Navbar } from "@/components/Navbar";
import { CentralServerGetUserInfo, CentralServerUpdateUserInfo } from "@/lib/api/auth";
import { Program } from "@/lib/info";
import { notifications } from "@mantine/notifications";

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
    const [onboardingStarted, { open: startOnboarding, close: stopOnboarding }] = useDisclosure(false, {
        onOpen: () => { console.debug("Onboarding tour started") },
        onClose: () => { console.debug("Onboarding tour ended") },
    });
    const fetchUserInfo = async () => {
        console.debug("Fetching user information");
        const userInfo = await CentralServerGetUserInfo();
        setUserRole(userInfo.roleId);
        const finishedTutorials: string[] = userInfo.finishedTutorials.split(",");
        if (!finishedTutorials.includes("dbob")) {
            console.debug("Starting onboarding tour");
            startOnboarding();
        }
    };
    const updateOnboardingStatus = async () => {
        console.debug("Updating onboarding status");
        stopOnboarding();
        const userInfo = await CentralServerGetUserInfo();
        const finishedTutorials: string[] = userInfo.finishedTutorials.split(",");
        finishedTutorials.push("dbob");
        const updatedUserInfo = {
            ...userInfo,
            finishedTutorials: finishedTutorials.join(","),
        };
        try {
            console.debug("Updating user info in server...");
            await CentralServerUpdateUserInfo(updatedUserInfo);
            console.debug("User info updated successfully");
        } catch (error) {
            console.error("Error updating user info", error);
            notifications.show({ title: "Error", message: "Error updating user info" });
        }
    }

    const onboardingSteps: OnboardingTourStep[] = [
        {
            id: "onboarding-navbar-header",
            title: `Welcome to ${Program.name}`,
            content: "Let's get you started with a quick tour.",
        },
        {
            id: "onboarding-navbar-dashboard",
            title: "Dashboard",
            content: "This is the dashboard. Here you can see an overview of your school's statistics and reports.",
        },
        {
            id: "onboarding-navbar-statistics",
            title: "Statistics",
            content: "Here you can see the statistics of your school in graph and table forms.",
        },
        {
            id: "onboarding-navbar-reports",
            title: "Reports",
            content: "In this section, you can view and manage financial reports of your school.",
        },
        {
            id: "onboarding-navbar-profile",
            title: "Profile",
            content: "You can view and edit your account profile information here.",
        },
    ];


    useEffect(() => {
        console.debug("LoggedInContent useEffect started", { isAuthenticated });
        if (!isAuthenticated) {
            router.push("/");
        }
        fetchUserInfo();
    }, [isAuthenticated, router]);

    console.debug("Rendering LoggedInContent", { isAuthenticated });
    return (
        // FIXME: Onboarding process does not work
        <OnboardingTour
            tour={onboardingSteps}
            started={onboardingStarted}
            onOnboardingTourEnd={updateOnboardingStatus}
            onOnboardingTourClose={updateOnboardingStatus}
        >
            <AppShell
                // header={{ height: 60 }}
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
        </OnboardingTour>
    );
}
