"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { SpotlightComponent } from "@/components/SpotlightComponent";
import { GetSelfNotifications } from "@/lib/api/notification";
import { notificationIcons } from "@/lib/info";
import { useUser } from "@/lib/providers/user";
import { NotificationType } from "@/lib/types";
import { Avatar, Card, Container, Group, Text, Title } from "@mantine/core";
import React, { Suspense, useEffect, useState } from "react";

function DashboardContent() {
    const userCtx = useUser();
    const [HVNotifications, setHVNotifications] = useState<NotificationType[]>([]);
    useEffect(() => {
        const fetchNotifications = async () => {
            const notifications = await GetSelfNotifications(true, true, 0, 1);
            setHVNotifications(notifications);
        };
        fetchNotifications();
    }, []);

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
                <Card padding="lg" radius="md" withBorder>
                    <Title order={4}>Important Notifications</Title>
                    {HVNotifications.length > 0 ? (
                        HVNotifications.map((notification) => (
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
