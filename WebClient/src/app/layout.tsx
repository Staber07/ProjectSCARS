// NOTE: react-scan must be the top-most import
import { ReactScan } from "@/components/dev/ReactScan";

import { Program } from "@/lib/info";
import { defaultColorscheme, theme } from "@/lib/theme";
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
        <html lang="en" suppressHydrationWarning>
            <ReactScan />
            <Head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('user-preferences');
                  if (stored) {
                    const { darkMode } = JSON.parse(stored);
                    if (darkMode) {
                      document.documentElement.style.colorScheme = 'dark';
                      document.documentElement.setAttribute('data-mantine-color-scheme', 'dark');
                      document.documentElement.style.backgroundColor = '#1A1B1E';
                    }
                  }
                } catch (e) {}
              })();
            `,
                    }}
                />
                <ColorSchemeScript />
            </Head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme={defaultColorscheme}>
                    {children}
                    <Notifications limit={5} autoClose={5000} />
                </MantineProvider>
            </body>
        </html>
    );
}
