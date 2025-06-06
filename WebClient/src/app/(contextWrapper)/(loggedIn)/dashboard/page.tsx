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
import React, { Suspense, useEffect, useState } from "react";

const stepsToComplete: [string, boolean][] = [
    ["Add and verify your email address", false],
    ["Complete your profile information", false],
    ["Add a profile picture", false],
    ["Set up two-factor authentication", false],
];

function DashboardContent() {
    const userCtx = useUser();
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    const [HVNotifications, setHVNotifications] = useState<NotificationType[]>([]);
    const [setupCompleteDismissed, setSetupCompleteDismissed] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setSetupCompleteDismissed(localStorage.getItem("setupCompleteDismissed") === "true");
        GetUserInfo()
            .then((userInfo) => {
                if (userInfo[0].avatarUrn) {
                    GetUserAvatar(userInfo[0].avatarUrn).then((userAvatar) => {
                        if (userAvatar) {
                            console.debug("User avatar fetched successfully", { size: userAvatar.size });
                        } else {
                            console.warn("No avatar found for user, using default avatar.");
                        }
                        userCtx.updateUserInfo(userInfo[0], userInfo[1], userAvatar);
                    });
                } else {
                    userCtx.updateUserInfo(userInfo[0], userInfo[1]);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch user info:", error);
                notifications.show({
                    title: "Session expired",
                    message: "Your session has expired. Please log in again.",
                    color: "red",
                    icon: <IconRefreshAlert />,
                });
            });
        const fetchNotifications = async () => {
            const notifications = await GetSelfNotifications(true, true, 0, 1);
            setHVNotifications(notifications);
        };
        fetchNotifications();
    });

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

    console.debug("Rendering DashboardPage");
    return (
        <Container>
            <SpotlightComponent />
            <Group gap={20}>
                <Avatar
                    variant="light"
                    radius="lg"
                    size={100}
                    color="#258ce6"
                    src={userCtx.userAvatarUrl ? userCtx.userAvatarUrl : undefined}
                />
                {userCtx.userInfo?.nameFirst ? (
                    <Title>Welcome, {userCtx.userInfo.nameFirst}!</Title>
                ) : userCtx.userInfo?.username ? (
                    <Title>Welcome, {userCtx.userInfo.username}!</Title>
                ) : (
                    <Title>Welcome!</Title>
                )}
            </Group>
            <Container mt={20}>
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
                <Card p="md" radius="md">
                    <Title order={4}>Important Notifications</Title>
                    {HVNotifications.length > 0 ? (
                        HVNotifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href="/account/notifications"
                                style={{ textDecoration: "none" }}
                            >
                                <Card key={notification.id} withBorder radius="md" p="md">
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
                        ))
                    ) : (
                        <Text size="sm" c="dimmed" mt={10}>
                            No important notifications at the moment.
                        </Text>
                    )}
                </Card>
            </Container>
        </Container>
    );
}
export default function DashboardPage() {
    return (
        <Suspense fallback={<LoadingComponent message="Loading dashboard..." withBorder={false} />}>
            <DashboardContent />
        </Suspense>
    );
}
