"use client";

import {
  Container,
  Title,
  Switch,
  NumberInput,
  Select,
  Button,
  Group,
  Paper,
} from "@mantine/core";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const [sidebar, setSidebar] = useState("expanded");
  const [refreshInterval, setRefreshInterval] = useState<number | "">(5);
  const [rowsPerPage, setRowsPerPage] = useState<number | "">(10);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("scars-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      setTheme(settings.theme);
      setSidebar(settings.sidebar);
      setRefreshInterval(settings.refreshInterval);
      setRowsPerPage(settings.rowsPerPage);
      setAnimationsEnabled(settings.animationsEnabled);
    }
  }, []);

  const handleSave = () => {
    const settings = {
      theme,
      sidebar,
      refreshInterval,
      rowsPerPage,
      animationsEnabled,
    };
    localStorage.setItem("scars-settings", JSON.stringify(settings));
    alert("Settings saved!");
  };

  return (
    <Container size="sm">
      <Title order={2} mb="md">
        Website Settings
      </Title>

      <Paper withBorder shadow="sm" p="md" radius="md">
        <Group justify="center" grow>

          <Select
            label="Theme"
            value={theme}
            onChange={(val) => setTheme(val!)}
            data={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />

          <Select
            label="Sidebar Layout"
            value={sidebar}
            onChange={(val) => setSidebar(val!)}
            data={[
              { value: "expanded", label: "Expanded" },
              { value: "compact", label: "Compact" },
            ]}
          />

          <NumberInput
            label="Auto Refresh Interval (minutes)"
            value={refreshInterval}
            onChange={(value) => setRefreshInterval(typeof value === "number" ? value : "")}
            min={1}
          />

          <NumberInput
            label="Default Table Rows per Page"
            value={rowsPerPage}
            onChange={(value) => setRowsPerPage(typeof value === "number" ? value : "")}
            min={5}
          />

          <Switch
            label="Enable Animations"
            checked={animationsEnabled}
            onChange={(event) => setAnimationsEnabled(event.currentTarget.checked)}
          />

          <Button mt="md" onClick={handleSave}>
            Save Settings
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
