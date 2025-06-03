"use client";

import { Box, Divider, Group, Stack, Title, Text, Container, Table, ActionIcon, Tooltip } from "@mantine/core";

import { ArchiveNotification, GetSelfNotifications } from "@/lib/api/notification";
import React, { JSX, useEffect, useState } from "react";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { NotificationType } from "@/lib/types";
import {
    IconAlertCircle,
    IconCircleCheck,
    IconInfoCircle,
    IconInfoTriangle,
    IconMail,
    IconMailOpened,
    IconShieldLock,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const notificationIcons: Record<string, [React.ComponentType<any>, string]> = {
    info: [IconInfoCircle, "blue"],
    warning: [IconInfoTriangle, "yellow"],
    error: [IconAlertCircle, "red"],
    success: [IconCircleCheck, "green"],
    mail: [IconMail, "pink"],
    security: [IconShieldLock, "orange"],
};

export default function NotificationsPage() {
    console.debug("Rendering NotificationsPage");
    const [loading, setLoading] = useState(true);
    const [notificationsList, setNotificationsList] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await GetSelfNotifications();
                console.debug("Fetched notifications:", data);
                setNotificationsList(
                    data.map((notification: NotificationType) => {
                        if (notification.archived) {
                            return <></>;
                        }

                        const IconComponent = notificationIcons[notification.type]?.[0] || IconInfoCircle;
                        const iconColor = notificationIcons[notification.type]?.[1] || "gray";

                        return (
                            <Table.Tr key={notification.id}>
                                <Table.Td>
                                    <Group>
                                        <IconComponent size={24} color={iconColor} />
                                        <Stack>
                                            <Text size="lg">{notification.title}</Text>
                                            <Text size="sm">{notification.content}</Text>
                                        </Stack>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Tooltip label="Mark as Read" withArrow>
                                        <ActionIcon
                                            variant="light"
                                            onClick={() => handleMarkAsRead(notification.id, iconColor, IconComponent)}
                                        >
                                            <IconMailOpened />
                                        </ActionIcon>
                                    </Tooltip>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })
                );
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        const handleMarkAsRead = async (
            notificationId: string,
            iconColor: string,
            IconComponent: React.ComponentType
        ) => {
            ArchiveNotification(notificationId)
                .then(() => {
                    setNotificationsList((prev) =>
                        prev.filter((notificationElement) => notificationElement.key !== notificationId)
                    );

                    notifications.show({
                        title: "Notification Archived",
                        message: `The notification has been archived.`,
                        color: iconColor,
                        icon: <IconComponent />,
                    });
                })
                .catch((error) => {
                    console.error("Failed to archive notification:", error);
                    notifications.show({
                        title: "Error",
                        message: "Failed to archive the notification.",
                        color: "red",
                        icon: <IconAlertCircle />,
                    });
                });
        };
        fetchNotifications();
    }, []);

    return (
        <Box mx="auto" p="lg">
            <Title order={3} mb="sm">
                Notifications
            </Title>
            <Divider mb="lg" />
            <Container p={25}>
                {loading && <LoadingComponent withBorder={false} />}
                {!loading && (
                    <Table withTableBorder>
                        <Table.Tbody>{notificationsList}</Table.Tbody>
                    </Table>
                )}
            </Container>
        </Box>
    );
}
