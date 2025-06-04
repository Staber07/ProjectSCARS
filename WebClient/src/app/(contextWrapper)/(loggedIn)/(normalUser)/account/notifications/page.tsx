"use client";

import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { ArchiveNotification, GetSelfNotifications } from "@/lib/api/notification";
import { NotificationType } from "@/lib/types";
import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Card,
    Checkbox,
    Divider,
    Group,
    ScrollArea,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

dayjs.extend(relativeTime);
const notificationIcons: Record<string, [React.ComponentType, string]> = {
    info: [IconInfoCircle, "blue"],
    warning: [IconInfoTriangle, "yellow"],
    error: [IconAlertCircle, "red"],
    success: [IconCircleCheck, "green"],
    mail: [IconMail, "pink"],
    security: [IconShieldLock, "orange"],
};

export default function NotificationsPage() {
    const [loading, setLoading] = useState(true);
    const [allNotifications, setAllNotifications] = useState<NotificationType[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<NotificationType[]>([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [groupBy, setGroupBy] = useState("Date");
    const [selectAll, setSelectAll] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const handleFetch = async () => {
        try {
            const data = await GetSelfNotifications();
            setAllNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (id: string) => {
        const notif = allNotifications.find((n) => n.id === id);
        if (!notif) return;
        try {
            await ArchiveNotification(id);
            notifications.show({
                title: "Notification Archived",
                message: `The notification has been archived.`,
                color: notificationIcons[notif.type]?.[1] || "gray",
                icon: React.createElement(notificationIcons[notif.type]?.[0] || IconInfoCircle),
            });
            setAllNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            if (error instanceof Error) {
                notifications.show({
                    title: "Error",
                    message: `Failed to archive the notification: ${error.message}`,
                    color: "red",
                    icon: <IconAlertCircle />,
                });
            } else {
                notifications.show({
                    title: "Error",
                    message: "Failed to archive the notification.",
                    color: "red",
                    icon: <IconAlertCircle />,
                });
            }
        }
    };

    useEffect(() => {
        handleFetch();
    }, []);

    useEffect(() => {
        const updateFiltered = () => {
            let result = [...allNotifications];
            if (filter === "unread") result = result.filter((n) => !n.archived);
            if (search.trim()) {
                result = result.filter(
                    (n) =>
                        n.title.toLowerCase().includes(search.toLowerCase()) ||
                        n.content.toLowerCase().includes(search.toLowerCase())
                );
            }
            setFilteredNotifications(result);
        };

        updateFiltered();
    }, [allNotifications, filter, search]);

    return (
        <Box p="md">
            <Title order={1} mb="md">
                Notifications
            </Title>
            <Divider my="md" />
            <Group justify="space-between" mb="sm">
                <SegmentedControl
                    value={filter}
                    onChange={setFilter}
                    data={[
                        { label: "All", value: "all" },
                        { label: "Unread", value: "unread" },
                    ]}
                />
                <TextInput
                    style={{ width: 500 }}
                    placeholder="Search notifications"
                    leftSection={<IconSearch size={14} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                />
                <Select
                    value={groupBy}
                    onChange={(value) => {
                        if (value) setGroupBy(value);
                    }}
                    data={["Date", "Type"]}
                />
            </Group>

            <Group mb="sm" justify="space-between">
                <Checkbox
                    label="Select all"
                    checked={selectAll}
                    onChange={(event) => {
                        const checked = event.currentTarget.checked;
                        setSelectAll(checked);
                        setSelected(checked ? new Set(filteredNotifications.map((n) => n.id)) : new Set());
                    }}
                    mb="sm"
                />
                {selected.size > 0 && (
                    <Group>
                        <Text>
                            {selected.size == 1
                                ? `Selected ${selected.size} notification`
                                : `Selected ${selected.size} notifications`}
                        </Text>
                        <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => {
                                if (selected.size === 0) {
                                    notifications.show({
                                        title: "No Notifications Selected",
                                        message: "Please select at least one notification to archive.",
                                        color: "yellow",
                                        icon: <IconAlertCircle />,
                                    });
                                    return;
                                }
                                const ids = Array.from(selected);
                                Promise.all(ids.map((id) => ArchiveNotification(id)))
                                    .then(() => {
                                        notifications.show({
                                            title: "Notifications Archived",
                                            message: `Successfully archived ${ids.length} notifications.`,
                                            color: "green",
                                            icon: <IconCircleCheck />,
                                        });
                                        setAllNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
                                        setSelected(new Set());
                                    })
                                    .catch((error) => {
                                        notifications.show({
                                            title: "Error Archiving Notifications",
                                            message:
                                                error instanceof Error ? error.message : "An unknown error occurred.",
                                            color: "red",
                                            icon: <IconAlertCircle />,
                                        });
                                    });
                            }}
                        >
                            <IconMailOpened />
                        </ActionIcon>
                    </Group>
                )}
            </Group>

            <ScrollArea h={600}>
                <Stack>
                    {loading && <LoadingComponent withBorder={false} />}
                    {!loading && filteredNotifications.length === 0 && <Text>No notifications found.</Text>}
                    {!loading &&
                        filteredNotifications
                            .slice()
                            .reverse()
                            .map((n) => {
                                const IconComponent = notificationIcons[n.type]?.[0] || IconInfoCircle;
                                const color = notificationIcons[n.type]?.[1] || "gray";
                                const isChecked = selected.has(n.id);
                                return (
                                    <Card key={n.id} withBorder radius="md" p="md">
                                        <Group align="flex-start">
                                            <Checkbox
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const newSet = new Set(selected);
                                                    if (e.currentTarget.checked) newSet.add(n.id);
                                                    else newSet.delete(n.id);
                                                    setSelected(newSet);
                                                }}
                                            />
                                            <Avatar color={color} radius="xl">
                                                <IconComponent />
                                            </Avatar>
                                            <Stack gap={0} style={{ flex: 1 }}>
                                                <Group justify="space-between">
                                                    <Text fw={500}>{n.title}</Text>
                                                    <Tooltip
                                                        position="bottom"
                                                        label={dayjs(n.created).format("YYYY-MM-DD HH:mm:ss")}
                                                        withArrow
                                                    >
                                                        <Badge>{dayjs(n.created).fromNow()}</Badge>
                                                    </Tooltip>
                                                </Group>
                                                <Text size="sm" c="dimmed">
                                                    {n.content}
                                                </Text>
                                            </Stack>
                                            <Tooltip position="bottom" label="Mark as Read" withArrow>
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleArchive(n.id)}
                                                >
                                                    <ActionIcon variant="subtle">
                                                        <IconMailOpened />
                                                    </ActionIcon>
                                                </motion.div>
                                            </Tooltip>
                                        </Group>
                                    </Card>
                                );
                            })}
                </Stack>
            </ScrollArea>
        </Box>
    );
}
