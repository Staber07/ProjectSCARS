// NOTE: react-scan must be the top-most import
import { ReactScan } from "@/components/dev/ReactScan";

import type { Metadata } from "next";

import Head from "next/head";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { Program } from "@/lib/info";
import { defaultColorscheme, theme } from "@/lib/theme";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/spotlight/styles.css';

// Set page metadata
export const metadata: Metadata = {
  title: Program.name,
  description: Program.description,
};

/** The layout for the entire application. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.debug("Rendering RootLayout");
  return (
    <html lang="en" {...mantineHtmlProps}>
      <ReactScan />
      <Head>
        <ColorSchemeScript />
      </Head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme={defaultColorscheme}>
          {children}
          <Notifications />
        </MantineProvider>
      </body>
    </html>
  );
}
