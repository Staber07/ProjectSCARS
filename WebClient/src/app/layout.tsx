import type { Metadata } from "next";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

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
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme={defaultColorscheme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
