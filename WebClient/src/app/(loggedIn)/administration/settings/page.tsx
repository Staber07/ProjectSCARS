"use client";

import {
  Box,
  Text,
  Title,
  Switch,
  Select,
  ColorInput,
  TextInput,
  Stack,
  Group,
  Container,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { IconBrandGithub, IconSettings, IconTool, IconInfoCircle } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <Container size="sm" pt="md">
      <Title order={2} mb="md">⚙️ Website Settings</Title>

      <Paper shadow="sm" p="md" radius="md" mb="xl">
        <Title order={4} mb="xs">🎨 Appearance</Title>
        <Stack>
          <Switch label="Dark Mode" />
          <ColorInput label="Accent Color" defaultValue="#228be6" />
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md" mb="xl">
        <Title order={4} mb="xs">🔧 General</Title>
        <Stack>
          <TextInput label="App Title" placeholder="e.g., Project SCARS" />
          <Select
            label="Default Language"
            data={["English", "Filipino", "Spanish"]}
            defaultValue="English"
          />
          <Select
            label="Timezone"
            data={["UTC+8 (Philippines)", "UTC+9 (Japan)", "UTC+0 (GMT)"]}
            defaultValue="UTC+8 (Philippines)"
          />
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md" mb="xl">
        <Title order={4} mb="xs">💾 Data & Sync</Title>
        <Stack>
          <Switch label="Auto Save" />
          <Select
            label="Sync Frequency"
            data={["5 min", "15 min", "30 min", "Manual"]}
            defaultValue="15 min"
          />
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md" mb="xl">
        <Title order={4} mb="xs">🧪 Advanced</Title>
        <Stack>
          <Switch label="Developer Mode" />
          <Switch label="Show Debug Console" />
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md">
        <Title order={4} mb="xs">ℹ️ About</Title>
        <Stack>
          <Group>
            <ThemeIcon variant="light" color="blue">
              <IconTool size={18} />
            </ThemeIcon>
            <Text size="sm">Version: 0.3.6</Text>
          </Group>
          <Group>
            <ThemeIcon variant="light" color="gray">
              <IconBrandGithub size={18} />
            </ThemeIcon>
            <Text
              size="sm"
              component="a"
              href="https://github.com/Chris1320/ProjectSCARS"
              target="_blank"
            >
              View on GitHub
            </Text>
          </Group>
          <Group>
            <ThemeIcon variant="light" color="teal">
              <IconInfoCircle size={18} />
            </ThemeIcon>
            <Text size="sm">License: MIT</Text>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
