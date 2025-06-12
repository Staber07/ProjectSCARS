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

    useEffect(() => {
        if (userCtx.userInfo) {
            const totalSteps = stepsToComplete.length;
            let completedSteps = 0;

            if (userCtx.userInfo?.emailVerified) {
                completedSteps++;
                stepsToComplete[0][1] = true;
            }
            if (userCtx.userInfo?.nameFirst && userCtx.userInfo?.nameLast) {
                completedSteps++;
                stepsToComplete[1][1] = true;
            }
            if (userCtx.userInfo?.avatarUrn) {
                completedSteps++;
                stepsToComplete[2][1] = true;
            }
            // TODO: Uncomment when two-factor authentication is implemented
            // if (userCtx.userInfo.twoFactorEnabled) {completedSteps++; stepsToComplete[3][1] = true;}

            setProfileCompletionPercentage(Math.round((completedSteps / totalSteps) * 100));
        }
    }, [userCtx.userInfo]);

    useEffect(() => {
        const NOTIFICATION_CHECK_INTERVAL = 60000; // Check every minute

        const checkNotifications = async () => {
            try {
                const notifications = await GetSelfNotifications(true, true, 0, 1);
                setHVNotifications(notifications);
                setLastNotificationCheck(new Date());
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        const intervalId = setInterval(checkNotifications, NOTIFICATION_CHECK_INTERVAL);

        return () => clearInterval(intervalId);
    }, []); // Empty dependency array as we want this to run only once on mount

    // Add this near your other useEffect hooks
    useEffect(() => {
        const fetchNotifications = async () => {
            setIsNotificationLoading(true);
            try {
                const notifications = await GetSelfNotifications(true, true, 0, 1);
                setHVNotifications(notifications);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setIsNotificationLoading(false);
            }
        };

        fetchNotifications();
    }, []);

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
                                        >
                                            <Text
                                                size="sm"
                                                style={{ textDecoration: completed ? "line-through" : "none" }}
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
