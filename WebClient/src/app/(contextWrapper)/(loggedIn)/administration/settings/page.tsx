"use client";

import { useEffect, useState } from "react";
import {
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
    useMantineColorScheme,
} from "@mantine/core";
import { IconBrandGithub, IconTool, IconInfoCircle } from "@tabler/icons-react";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

interface WebsiteSettings {
    darkMode: boolean;
    accentColor: string;
    appTitle: string;
    language: string;
    timezone: string;
    autoSave: boolean;
    syncFrequency: string;
    developerMode: boolean;
    showDebugConsole: boolean;
}

export default function SettingsPage() {
    const { setColorScheme } = useMantineColorScheme();

    // Load settings from local storage or use defaults
    const [settings, setSettings] = useLocalStorage<WebsiteSettings>({
        key: "website-settings",
        defaultValue: {
            darkMode: false,
            accentColor: "#228be6",
            appTitle: "Project SCARS",
            language: "English",
            timezone: "UTC+8 (Philippines)",
            autoSave: true,
            syncFrequency: "15 min",
            developerMode: false,
            showDebugConsole: false,
        },
    });

    // Apply settings on load
    useEffect(() => {
        // Apply dark mode
        setColorScheme(settings.darkMode ? "dark" : "light");

        // Apply app title
        document.title = settings.appTitle;

        // Apply accent color (you'll need to implement CSS variable updates)
        document.documentElement.style.setProperty("--mantine-primary-color-filled", settings.accentColor);

        // Log for developer mode
        if (settings.developerMode) {
            console.log("Developer mode enabled");
        }
    }, [settings, setColorScheme]);

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
                ⚙️ Website Settings
            </Title>

            <Paper shadow="sm" p="md" radius="md" mb="xl">
                <Title order={4} mb="xs">
                    🎨 Appearance
                </Title>
                <Stack>
                    <Switch
                        label="Dark Mode"
                        checked={settings.darkMode}
                        onChange={(e) => handleSettingChange("darkMode", e.currentTarget.checked)}
                    />
                    <ColorInput
                        label="Accent Color"
                        value={settings.accentColor}
                        onChange={(color) => handleSettingChange("accentColor", color)}
                    />
                </Stack>
            </Paper>

            <Paper shadow="sm" p="md" radius="md" mb="xl">
                <Title order={4} mb="xs">
                    🔧 General
                </Title>
                <Stack>
                    <TextInput
                        label="App Title"
                        value={settings.appTitle}
                        onChange={(e) => handleSettingChange("appTitle", e.currentTarget.value)}
                        placeholder="e.g., Project SCARS"
                    />
                    <Select
                        label="Default Language"
                        data={["English", "Filipino", "Spanish"]}
                        value={settings.language}
                        onChange={(value) => handleSettingChange("language", value)}
                    />
                    <Select
                        label="Timezone"
                        data={["UTC+8 (Philippines)", "UTC+9 (Japan)", "UTC+0 (GMT)"]}
                        value={settings.timezone}
                        onChange={(value) => handleSettingChange("timezone", value)}
                    />
                </Stack>
            </Paper>

            <Paper shadow="sm" p="md" radius="md" mb="xl">
                <Title order={4} mb="xs">
                    💾 Data & Sync
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
                    🧪 Advanced
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
