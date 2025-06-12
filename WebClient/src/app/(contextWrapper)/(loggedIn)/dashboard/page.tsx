"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { SpotlightComponent } from "@/components/SpotlightComponent";
import { GetUserInfo } from "@/lib/api/auth";
import { GetSelfNotifications } from "@/lib/api/notification";
import { GetUserAvatar } from "@/lib/api/user";
import { notificationIcons } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { NotificationType } from "@/lib/types";
import {
    Avatar,
    Card,
    Container,
    Flex,
    Group,
    List,
    SemiCircleProgress,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCircleCheck, IconCircleDashed, IconRefreshAlert } from "@tabler/icons-react";
import Link from "next/link";
import React, { Suspense, memo, useEffect, useState } from "react";
import { HomeSection } from "@/components/Dashboard/HomeSection";

const stepsToComplete: [string, boolean][] = [
    ["Add and verify your email address", false],
    ["Complete your profile information", false],
    ["Add a profile picture", false],
    ["Set up two-factor authentication", false],
];

const DashboardContent = memo(function DashboardContent() {
    const userCtx = useUser();
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    const [HVNotifications, setHVNotifications] = useState<NotificationType[]>([]);
    const [setupCompleteDismissed, setSetupCompleteDismissed] = useState(false);
    const [lastNotificationCheck, setLastNotificationCheck] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [isNotificationLoading, setIsNotificationLoading] = useState(true);

    // Handle step click (placeholder, update as needed)
    const handleStepClick = (index: number) => {
        // You can add navigation or logic for each step here
        // For now, just log the step index
        console.log(`Step ${index} clicked`);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const initializeDashboard = async () => {
            setIsLoading(true);
            // Check setup complete status only once
            setSetupCompleteDismissed(localStorage.getItem("setupCompleteDismissed") === "true");

            try {
                // Fetch user info
                const userInfo = await GetUserInfo();

                if (userInfo[0].avatarUrn) {
                    const userAvatar = await GetUserAvatar(userInfo[0].avatarUrn);
                    if (userAvatar) {
                        console.debug("User avatar fetched successfully", { size: userAvatar.size });
                    } else {
                        console.warn("No avatar found for user, using default avatar.");
                    }
                    userCtx.updateUserInfo(userInfo[0], userInfo[1], userAvatar);
                } else {
                    userCtx.updateUserInfo(userInfo[0], userInfo[1]);
                }

                // Fetch notifications
                const notifications = await GetSelfNotifications(true, true, 0, 1);
                setHVNotifications(notifications);
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                notifications.show({
                    id: "session-expired",
                    title: "Session expired",
                    message: "Your session has expired. Please log in again.",
                    color: "red",
                    icon: <IconRefreshAlert />,
                });
            } finally {
                setIsLoading(false);
            }
        };

        initializeDashboard();
    }, [userCtx]); // Only run on mount and when userCtx changes

    // Update the profile completion calculation in useEffect
    useEffect(() => {
        if (userCtx.userInfo) {
            const calculateSteps = async () => {
                const totalSteps = stepsToComplete.length;
                let completedSteps = 0;
                const updatedSteps = [...stepsToComplete];

                // Step 1: Email verification
                if (userCtx.userInfo?.emailVerified) {
                    completedSteps++;
                    updatedSteps[0][1] = true;
                }

                // Step 2: Profile information
                if (userCtx.userInfo?.nameFirst && userCtx.userInfo?.nameLast && userCtx.userInfo?.email) {
                    completedSteps++;
                    updatedSteps[1][1] = true;
                }

                // Step 3: Profile picture
                if (userCtx.userInfo?.avatarUrn) {
                    completedSteps++;
                    updatedSteps[2][1] = true;
                }

                // Step 4: Two-factor authentication
                try {
                    const userInfo = await GetUserInfo();
                    // If twoFactorEnabled is not on UserPublicType, check userInfo[1] or adjust as needed
                    if ("twoFactorEnabled" in userInfo[1] && userInfo[1].twoFactorEnabled) {
                        completedSteps++;
                        updatedSteps[3][1] = true;
                    }
                } catch (error) {
                    console.error("Failed to check 2FA status:", error);
                }

                // Update the completion percentage and steps
                setProfileCompletionPercentage(Math.round((completedSteps / totalSteps) * 100));
                stepsToComplete.forEach((_, index) => {
                    stepsToComplete[index][1] = updatedSteps[index][1];
                });
            };

            calculateSteps();
        }
    }, [userCtx.userInfo]);

    // Update the notification check interval useEffect
    useEffect(() => {
        const NOTIFICATION_CHECK_INTERVAL = 60000; // Check every minute

        const checkNotifications = async () => {
            try {
                // Check if user is authenticated
                if (!userCtx.userInfo) {
                    return;
                }

                const notifications = await GetSelfNotifications(true, true, 0, 1);
                setHVNotifications(notifications);
                setLastNotificationCheck(new Date());
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
                // Clear interval if unauthorized
                if (
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as any).response === "object" &&
                    (error as any).response !== null &&
                    "status" in (error as any).response &&
                    (error as any).response.status === 401
                ) {
                    clearInterval(intervalId);
                }
            }
        };

        const intervalId = setInterval(checkNotifications, NOTIFICATION_CHECK_INTERVAL);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [userCtx.userInfo]); // Add userCtx.userInfo as dependency

    // Update the fetchNotifications function in the useEffect
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsNotificationLoading(true);
            try {
                // Check if user is authenticated
                if (!userCtx.userInfo) {
                    throw new Error("User not authenticated");
                }

                const notifications = await GetSelfNotifications(true, true, 0, 1);
                setHVNotifications(notifications);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
                // Handle unauthorized error
                if (
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof (error as any).response === "object" &&
                    (error as any).response !== null &&
                    "status" in (error as any).response &&
                    (error as any).response.status === 401
                ) {
                    notifications.show({
                        id: "unauthorized",
                        title: "Session Expired",
                        message: "Please log in again to view notifications",
                        color: "red",
                        icon: <IconRefreshAlert />,
                    });
                    // Optionally redirect to login
                    // window.location.href = '/auth/login';
                }
            } finally {
                setIsNotificationLoading(false);
            }
        };

        // Only fetch if user is authenticated
        if (userCtx.userInfo) {
            fetchNotifications();
        }
    }, [userCtx.userInfo]); // Add userCtx.userInfo as dependency

    console.debug("Rendering DashboardPage");
    if (isLoading) {
        return <LoadingComponent message="Loading dashboard..." withBorder={false} />;
    }

    // Update the main container and layout structure
    return (
        <Container size="xl" py="md">
            <Stack gap="md">
                <SpotlightComponent />

                {/* User Welcome Section */}
                <Card shadow="sm" p="md" radius="md" withBorder>
                    <Group gap={20}>
                        <Avatar variant="light" radius="lg" size={100} color="#258ce6" src={userCtx.userAvatarUrl} />
                        <Stack gap="xs">
                            {userCtx.userInfo?.nameFirst ? (
                                <Title>Welcome, {userCtx.userInfo.nameFirst}!</Title>
                            ) : userCtx.userInfo?.username ? (
                                <Title>Welcome, {userCtx.userInfo.username}!</Title>
                            ) : (
                                <Title>Welcome!</Title>
                            )}
                            <Text c="dimmed">Here's what's happening with your account</Text>
                        </Stack>
                    </Group>
                </Card>

                {/* Account Setup Section */}
                {profileCompletionPercentage !== 100 && !setupCompleteDismissed && (
                    <Card p="md" radius="md" withBorder>
                        <Flex justify="space-between" align="center" mb={20}>
                            <SemiCircleProgress
                                fillDirection="left-to-right"
                                orientation="up"
                                filledSegmentColor="blue"
                                value={profileCompletionPercentage}
                                transitionDuration={250}
                                label={`${profileCompletionPercentage}% Complete`}
                            />
                            <Stack style={{ flex: 1 }}>
                                <Title order={4}>Set Up Your Account</Title>
                                <Text size="sm" c="dimmed">
                                    Complete your profile, set up security features, and customize your preferences.
                                </Text>
                                <List spacing="xs" center>
                                    {stepsToComplete.map(([step, completed], index) => (
                                        <List.Item
                                            key={index}
                                            icon={
                                                <ThemeIcon color={completed ? "green" : "blue"} size={20} radius="xl">
                                                    {completed ? <IconCircleCheck /> : <IconCircleDashed />}
                                                </ThemeIcon>
                                            }
                                            c={completed ? "gray" : "dark"}
                                            style={{ cursor: completed ? "default" : "pointer" }}
                                            onClick={() => !completed && handleStepClick(index)}
                                        >
                                            <Text
                                                size="sm"
                                                style={{
                                                    textDecoration: completed ? "line-through" : "none",
                                                    cursor: completed ? "default" : "pointer",
                                                }}
                                            >
                                                {step}
                                            </Text>
                                        </List.Item>
                                    ))}
                                </List>
                            </Stack>
                        </Flex>
                        <Text
                            size="xs"
                            c="dimmed"
                            ta="right"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                localStorage.setItem("setupCompleteDismissed", "true");
                                setSetupCompleteDismissed(true);
                            }}
                        >
                            Dismiss
                        </Text>
                    </Card>
                )}

                {/* Notifications Section */}
                <Card p="md" radius="md" withBorder mb="xl">
                    <Title order={4}>Important Notifications</Title>
                    {isNotificationLoading ? (
                        <LoadingComponent message="Loading notifications..." withBorder={false} />
                    ) : HVNotifications.length > 0 ? (
                        HVNotifications.map((notification) => (
                            <NotificationCard key={notification.id} notification={notification} />
                        ))
                    ) : (
                        <Text size="sm" c="dimmed" mt={10}>
                            No important notifications at the moment.
                        </Text>
                    )}
                </Card>

                {/* Home Section */}
                <Suspense fallback={<LoadingComponent message="Loading content..." withBorder={false} />}>
                    <HomeSection />
                </Suspense>
            </Stack>
        </Container>
    );
});

// Memoize the setup steps component
const SetupSteps = memo(({ steps }: { steps: [string, boolean][] }) => (
    <List spacing="xs" center>
        {steps.map(([step, completed], index) => (
            <List.Item
                key={index}
                icon={
                    <ThemeIcon color={completed ? "green" : "blue"} size={20} radius="xl">
                        {completed ? <IconCircleCheck /> : <IconCircleDashed />}
                    </ThemeIcon>
                }
                c={completed ? "gray" : "dark"}
            >
                <Text size="sm" style={{ textDecoration: completed ? "line-through" : "none" }}>
                    {step}
                </Text>
            </List.Item>
        ))}
    </List>
));

// Memoize the notification card
const NotificationCard = memo(({ notification }: { notification: NotificationType }) => (
    <Link href="/account/notifications" style={{ textDecoration: "none" }}>
        <Card withBorder radius="md" p="md">
            <Group>
                <Avatar color={notificationIcons[notification.type]?.[1]} radius="xl">
                    {notificationIcons[notification.type]?.[0] &&
                        React.createElement(notificationIcons[notification.type][0])}
                </Avatar>
                <Text size="sm">{notification.content}</Text>
            </Group>
            <Text size="xs" c="dimmed" ta="right" mt={5}>
                {new Date(notification.created).toLocaleString()}
            </Text>
        </Card>
    </Link>
));

export default function DashboardPage() {
    return (
        <Suspense fallback={<LoadingComponent message="Loading dashboard..." withBorder={false} />}>
            <DashboardContent />
        </Suspense>
    );
}
