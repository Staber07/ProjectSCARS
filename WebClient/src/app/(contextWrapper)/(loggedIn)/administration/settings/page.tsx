"use client";

import { Container, Group, Paper, Select, Stack, Switch, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub, IconInfoCircle, IconTool } from "@tabler/icons-react";
import { useEffect } from "react";

interface WebsiteSettings {
    appTitle: string;
    autoSave: boolean;
    syncFrequency: string;
    developerMode: boolean;
    showDebugConsole: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useLocalStorage<WebsiteSettings>({
        key: "website-settings",
        defaultValue: {
            appTitle: "Project SCARS",
            autoSave: true,
            syncFrequency: "15 min",
            developerMode: false,
            showDebugConsole: false,
        },
    });

    useEffect(() => {
        // Apply app title
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
                    Data & Sync
                </Title>
                <Stack>
                    <Switch
                        label="Auto Save"
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange("autoSave", e.currentTarget.checked)}
                    />
                    <Select
                        label="Sync Frequency"
                        data={["5 min", "15 min", "30 min", "Manual"]}
                        value={settings.syncFrequency}
                        onChange={(value) => handleSettingChange("syncFrequency", value)}
                        disabled={!settings.autoSave}
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
                    <Switch
                        label="Show Debug Console"
                        checked={settings.showDebugConsole}
                        onChange={(e) => handleSettingChange("showDebugConsole", e.currentTarget.checked)}
                        disabled={!settings.developerMode}
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
