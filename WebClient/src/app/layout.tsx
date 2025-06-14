// NOTE: react-scan must be the top-most import
import { ReactScan } from "@/components/dev/ReactScan";

import { Program } from "@/lib/info";
import { theme } from "@/lib/theme";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import Head from "next/head";

import "@gfazioli/mantine-onboarding-tour/styles.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";

// Set page metadata
export const metadata: Metadata = {
    title: `${Program.name} | ${Program.description}`,
    description: Program.description,
};

interface RootLayoutProps {
    children: React.ReactNode;
}

/**
 * RootLayout component serves as the main layout for the application.
 * @param {RootLayoutProps} props - The properties for the RootLayout component.
 * @return {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({ children }: RootLayoutProps) {
    console.debug("Rendering RootLayout");
    return (
        <html lang="en">
            <ReactScan />
            <Head>
                <style>{`
                    :root[data-mantine-color-scheme="dark"] {
                        background-color: #1A1B1E !important;
                        color: #C1C2C5 !important;
                    }
                `}</style>
                <script>{`
                    (function() {
                        function setTheme(darkMode) {
                            document.documentElement.setAttribute('data-mantine-color-scheme', darkMode ? 'dark' : 'light');
                            document.documentElement.style.backgroundColor = darkMode ? '#1A1B1E' : '#FFFFFF';
                            document.documentElement.style.color = darkMode ? '#C1C2C5' : '#1A1B1E';
                        }

                        // Block rendering until theme is set
                        document.documentElement.style.display = 'none';

                        try {
                            const stored = localStorage.getItem('user-preferences');
                            if (stored) {
                                const { darkMode } = JSON.parse(stored);
                                setTheme(darkMode);
                            }
                        } catch (e) {
                            console.error('Failed to set theme:', e);
                        }

                        // Unblock rendering
                        document.documentElement.style.display = '';
                    })();
                `}</script>
                <ColorSchemeScript />
            </Head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme="light">
                    {children}
                    <Notifications limit={5} autoClose={5000} />
                </MantineProvider>
            </body>
        </html>
    );
}
