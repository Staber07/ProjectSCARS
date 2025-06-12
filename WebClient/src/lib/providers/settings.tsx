"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@mantine/hooks";

export interface WebsiteSettings {
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

interface SettingsContextType {
    settings: WebsiteSettings;
    updateSettings: (key: keyof WebsiteSettings, value: any) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useLocalStorage<WebsiteSettings>({
        key: "website-settings",
        defaultValue: {
            darkMode: false,
            accentColor: "#007bff",
            appTitle: "Project SCARS",
            language: "English",
            timezone: "UTC+8 (Philippines)",
            autoSave: true,
            syncFrequency: "15 min",
            developerMode: false,
            showDebugConsole: false,
        },
    });

    const updateSettings = (key: keyof WebsiteSettings, value: any) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
