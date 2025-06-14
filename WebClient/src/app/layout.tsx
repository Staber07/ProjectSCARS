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
        <html lang="en">
            <ReactScan />
            <Head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                let darkMode = false;
                try {
                  const stored = localStorage.getItem('user-preferences');
                  if (stored) {
                    darkMode = JSON.parse(stored).darkMode;
                  }
                } catch (e) {}
                
                if (darkMode) {
                  document.documentElement.setAttribute('data-mantine-color-scheme', 'dark');
                  document.documentElement.style.setProperty('--mantine-color-scheme', 'dark');
                  document.documentElement.style.setProperty('background-color', '#1A1B1E');
                  document.documentElement.style.setProperty('color', '#C1C2C5');
                }
              })();
            `,
                    }}
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              :root[data-mantine-color-scheme="dark"] {
                background-color: #1A1B1E !important;
                color: #C1C2C5 !important;
              }
              body[data-mantine-color-scheme="dark"] {
                background-color: #1A1B1E !important;
                color: #C1C2C5 !important;
              }
            `,
                    }}
                />
                <ColorSchemeScript />
            </Head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme="light" withCssVariables cssVariablesSelector="html">
                    {children}
                    <Notifications limit={5} autoClose={5000} />
                </MantineProvider>
            </body>
        </html>
    );
}
