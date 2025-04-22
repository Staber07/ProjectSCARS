import type { Metadata } from "next";

import Head from "next/head";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

import { Program } from "@/lib/info";
import { defaultColorscheme, theme } from "@/lib/theme";

import "@mantine/core/styles.css";

export const metadata: Metadata = {
  title: Program.name,
  description: Program.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
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
