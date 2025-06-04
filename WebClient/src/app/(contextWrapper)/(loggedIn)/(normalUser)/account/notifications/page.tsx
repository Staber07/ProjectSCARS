"use client";

import {
    ActionIcon,
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Group,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core";
import {
    IconAlertCircle,
    IconCircleCheck,
    IconInfoCircle,
    IconInfoTriangle,
    IconMail,
    IconMailOpened,
    IconSearch,
    IconShieldLock,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ArchiveNotification, GetSelfNotifications } from "@/lib/api/notification";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { notifications as mantineNotifications } from "@mantine/notifications";
import { NotificationType } from "@/lib/types";

const notificationIcons: Record<string, [React.ComponentType<any>, string]> = {
    info: [IconInfoCircle, "blue"],
    warning: [IconInfoTriangle, "yellow"],
    error: [IconAlertCircle, "red"],
    success: [IconCircleCheck, "green"],
    mail: [IconMail, "pink"],
    security: [IconShieldLock, "orange"],
};

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [notificationsData, setNotificationsData] = useState<NotificationType[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await GetSelfNotifications();
                setNotificationsData(data.filter((n: NotificationType) => !n.archived));
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (
        notificationId: string,
        iconColor: string,
        IconComponent: React.ComponentType
    ) => {
        try {
            await ArchiveNotification(notificationId);
            setNotificationsData((prev) => prev.filter((n) => n.id !== notificationId));
            mantineNotifications.show({
                title: "Notification Archived",
                message: `The notification has been archived.`,
                color: iconColor,
                icon: <IconComponent />,
            });
        } catch (error) {
            console.error("Failed to archive notification:", error);
            mantineNotifications.show({
                title: "Error",
                message: "Failed to archive the notification.",
                color: "red",
                icon: <IconAlertCircle />,
            });
        }
    };

    const filteredNotifications = notificationsData.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box mx="auto" p="lg">
            <Title order={3}>Notifications</Title>
            <TextInput
                icon={<IconSearch size={16} />}
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                my="md"
            />
            <Divider mb="md" />
            <Container p={0} px="md">
                {loading ? (
                    <LoadingComponent withBorder={false} />
                ) : filteredNotifications.length > 0 ? (
                    <Table highlightOnHover withTableBorder>
                        <Table.Tbody>
                            {filteredNotifications.map((notification) => {
                                const IconComponent = notificationIcons[notification.type]?.[0] || IconInfoCircle;
                                const iconColor = notificationIcons[notification.type]?.[1] || "gray";
                                return (
                                    <Table.Tr key={notification.id}>
                                        <Table.Td>
                                            <Group align="flex-start">
                                                <IconComponent size={24} color={iconColor} />
                                                <Stack gap={0}>
                                                    <Text size="md" fw={600}>{notification.title}</Text>
                                                    <Text size="sm" c="dimmed">{notification.content}</Text>
                                                </Stack>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Tooltip label="Mark as Read" withArrow>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    onClick={() => handleMarkAsRead(notification.id, iconColor, IconComponent)}
                                                >
                                                    <IconMailOpened />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                ) : (
                    <Text>No notifications found.</Text>
                )}
            </Container>
        </Box>
    );
}
