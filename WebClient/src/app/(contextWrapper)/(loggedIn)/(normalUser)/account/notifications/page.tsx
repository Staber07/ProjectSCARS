"use client";

import {
  Box,
  Divider,
  Group,
  Stack,
  Title,
  Text,
  Container,
  Table,
  ActionIcon,
  Tooltip,
  TextInput,
  Button,
  SegmentedControl,
  Checkbox,
  ScrollArea,
  Select,
  Card,
  Avatar,
  Badge,
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
import React, { JSX, useEffect, useState } from "react";
import { ArchiveNotification, GetSelfNotifications } from "@/lib/api/notification";
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent";
import { notifications } from "@mantine/notifications";
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
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to archive the notification.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  const updateFiltered = () => {
    let result = [...allNotifications];
    if (filter === "unread") result = result.filter((n) => !n.archived);
    if (search.trim()) {
      result = result.filter(
        (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredNotifications(result);
  };

  useEffect(() => {
    handleFetch();
  }, []);

  useEffect(() => {
    updateFiltered();
  }, [allNotifications, filter, search]);

  return (
    <Box p="md">
      <Title order={1} mb="md">Notifications</Title>
      <Divider my="md"/>
      <Group justify="space-between" mb="sm">
        <SegmentedControl value={filter} onChange={setFilter} data={[{ label: "All", value: "all" }, { label: "Unread", value: "unread" }]} />
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

      <ScrollArea h={600}>
        <Stack>
          {loading && <LoadingComponent withBorder={false} />}
          {!loading && filteredNotifications.length === 0 && <Text>No notifications found.</Text>}
          {!loading &&
            filteredNotifications.map((n) => {
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
                      <IconComponent size={16} />
                    </Avatar>
                    <Stack gap={0} style={{ flex: 1 }}>
                      <Group justify="space-between">
                        <Text fw={500}>{n.title}</Text>
                        {/* <Badge>{n.createdAt ? dayjs(n.createdAt).format("MMM D, YYYY h:mm A") : "Unknown date"}</Badge> */}
                      </Group>
                      <Text size="sm" c="dimmed">
                        {n.content}
                      </Text>
                    </Stack>
                    <Tooltip label="Mark as Read" withArrow>
                      <ActionIcon variant="light" onClick={() => handleArchive(n.id)}>
                        <IconMailOpened />
                      </ActionIcon>
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
