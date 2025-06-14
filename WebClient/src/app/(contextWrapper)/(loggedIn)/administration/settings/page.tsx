"use client";

import { Container, Group, Paper, Stack, Switch, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub, IconInfoCircle, IconTool } from "@tabler/icons-react";
import { useEffect } from "react";

interface WebsiteSettings {
    appTitle: string;
    developerMode: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useLocalStorage<WebsiteSettings>({
        key: "website-settings",
        defaultValue: {
            appTitle: "Project SCARS",
            developerMode: false,
        },
    });

    useEffect(() => {
        document.title = settings.appTitle;

        // Log for developer mode
        if (settings.developerMode) {
            console.log("Developer mode enabled");
        }
    }, [settings]);

    const handleSettingChange = (key: keyof WebsiteSettings, value: any) => {
        setSettings((prev) => ({ ...prev, [key]: value }));

        notifications.show({
            title: "Settings Updated",
            message: "Your changes have been saved",
            color: "green",
        });
    };

    return (
        <Container size="sm" pt="md">
            <Title order={2} mb="md">
                Website Settings
            </Title>

            <Paper shadow="sm" p="md" radius="md" mb="xl">
                <Title order={4} mb="xs">
                    General
                </Title>
                <Stack>
                    <TextInput
                        label="App Title"
                        value={settings.appTitle}
                        onChange={(e) => handleSettingChange("appTitle", e.currentTarget.value)}
                        placeholder="e.g., Project SCARS"
                    />
                </Stack>
            </Paper>

            <Paper shadow="sm" p="md" radius="md" mb="xl">
                <Title order={4} mb="xs">
                    Advanced
                </Title>
                <Stack>
                    <Switch
                        label="Developer Mode"
                        checked={settings.developerMode}
                        onChange={(e) => handleSettingChange("developerMode", e.currentTarget.checked)}
                    />
                </Stack>
            </Paper>

            <Paper shadow="sm" p="md" radius="md">
                <Title order={4} mb="xs">
                    ℹ️ About
                </Title>
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
                        <Text size="sm" component="a" href="https://github.com/Chris1320/ProjectSCARS" target="_blank">
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
