"use client";

import {
    Container,
    Group,
    Paper,
    Stack,
    Switch,
    Text,
    TextInput,
    ThemeIcon,
    Title,
    Accordion,
    NumberInput,
    PasswordInput,
    MultiSelect,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub, IconInfoCircle, IconTool } from "@tabler/icons-react";
import { useEffect } from "react";

interface WebsiteSettings {
    appTitle: string;
    developerMode: boolean;
    serverConfig: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useLocalStorage<WebsiteSettings>({
        key: "website-settings",
        defaultValue: {
            appTitle: "Project SCARS",
            developerMode: false,
            serverConfig: false,
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
                    Server Configuration
                </Title>
                <Switch
                    label="Enable Server Configuration"
                    checked={settings.serverConfig}
                    onChange={(e) => handleSettingChange("serverConfig", e.currentTarget.checked)}
                    mb="md"
                />
                {settings.serverConfig && (
                    <Accordion variant="contained">
                        <Accordion.Item value="debug">
                            <Accordion.Control>Debug Settings</Accordion.Control>
                            <Accordion.Panel>
                                <Stack>
                                    <Switch label="Debug Mode" />
                                    <Switch label="Log Environment Opt-out" />
                                    <Switch label="Show SQL" />
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="connection">
                            <Accordion.Control>Connection Settings</Accordion.Control>
                            <Accordion.Panel>
                                <TextInput label="Base URL" placeholder="http://localhost:8080" />
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="logging">
                            <Accordion.Control>Logging Settings</Accordion.Control>
                            <Accordion.Panel>
                                <Stack>
                                    <TextInput label="Log File Path" placeholder="./logs/centralserver.log" />
                                    <NumberInput label="Max Bytes" placeholder="10485760" min={0} />
                                    <NumberInput label="Backup Count" placeholder="5" min={0} />
                                    <TextInput label="Encoding" placeholder="utf-8" />
                                    <TextInput
                                        label="Log Format"
                                        placeholder="%(asctime)s:%(name)s:%(levelname)s:%(message)s"
                                    />
                                    <TextInput label="Date Format" placeholder="%d-%m-%y_%H-%M-%S" />
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="security">
                            <Accordion.Control>Security Settings</Accordion.Control>
                            <Accordion.Panel>
                                <Stack>
                                    <MultiSelect
                                        label="Allow Origins"
                                        placeholder="Add allowed origins"
                                        data={["http://127.0.0.1:8080", "http://localhost:8080"]}
                                        searchable
                                    />
                                    <Switch label="Allow Credentials" />
                                    <MultiSelect
                                        label="Allow Methods"
                                        placeholder="Add allowed methods"
                                        data={["GET", "POST", "PUT", "DELETE"]}
                                        defaultValue={["*"]}
                                        searchable
                                    />
                                    <MultiSelect
                                        label="Allow Headers"
                                        placeholder="Add allowed headers"
                                        data={["Content-Type", "Authorization"]}
                                        defaultValue={["*"]}
                                        searchable
                                    />
                                    <NumberInput label="Failed Login Notify Attempts" placeholder="2" min={1} />
                                    <NumberInput label="Failed Login Lockout Minutes" placeholder="15" min={1} />
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="mailing">
                            <Accordion.Control>Mail Settings</Accordion.Control>
                            <Accordion.Panel>
                                <Stack>
                                    <Switch label="Enable Mailing" />
                                    <TextInput label="SMTP Server" placeholder="smtp.gmail.com" />
                                    <NumberInput label="SMTP Port" placeholder="587" min={1} max={65535} />
                                    <TextInput label="From Address" placeholder="example@gmail.com" />
                                    <TextInput label="Username" placeholder="example@gmail.com" />
                                    <PasswordInput label="Password" placeholder="Enter SMTP password" />
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                )}
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
