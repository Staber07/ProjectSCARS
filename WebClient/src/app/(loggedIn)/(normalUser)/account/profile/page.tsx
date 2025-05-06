"use client";

import { Avatar, Group, Text, Title, Divider, Button } from "@mantine/core";
import { IconAt, IconPhoneCall } from '@tabler/icons-react';

export default function ProfilePage() {
  console.debug("Rendering ProfilePage");
  return (
    <div>
      <Group justify="space-between" mb="sm">
        <Title order={4} style={{ textDecoration: 'underline' }}>
          Profile
        </Title>
      </Group>

      <Divider mb="md" />

      <Group justify="space-between" align="flex-start" mb="md">
        <Group wrap="nowrap">
          <Avatar
            src=""
            size={130}
            radius="md"
          />
          <div>
            <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
              Canteen Manager
            </Text>

            <Text fz="lg" fw={500}>
              Robert Glassbreaker
            </Text>

            <Group wrap="nowrap" gap={10} mt={3}>
              <IconAt stroke={1.5} size={16} />
              <Text fz="xs" c="dimmed">
                robert@gmail.com
              </Text>
            </Group>

            <Group wrap="nowrap" gap={10} mt={5}>
              <IconPhoneCall stroke={1.5} size={16} />
              <Text fz="xs" c="dimmed">
                +63 933 1234567
              </Text>
            </Group>
          </div>
        </Group>

        <Button
          variant="outline"
          size="sm">
          Edit Profile
        </Button>
      </Group>
    </div>
  );
}
