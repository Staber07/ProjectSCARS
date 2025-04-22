import { expect, test } from "vitest";
import { getByTestId, render } from "@testing-library/react";

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

import { LoadingComponent } from "@/components/LoadingComponent";

test("Test loading component without message", () => {
  const { container } = render(
    <html lang="en" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript />
      </Head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme={defaultColorscheme}>
          <LoadingComponent />
          <Notifications />
        </MantineProvider>
      </body>
    </html>,
  );

  const containerTitle = getByTestId(container, "loading-title");
  expect(containerTitle).not.toBeNull();
  expect(containerTitle!.textContent).toBe(Program.name);
  expect(container.querySelector("[data-testid='loading-message']")).toBeNull();
});

test("Test loading component with message", () => {
  const message = "Hello, World!";
  const { container } = render(
    <html lang="en" {...mantineHtmlProps}>
      <Head>
        <ColorSchemeScript />
      </Head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme={defaultColorscheme}>
          <LoadingComponent message={message} />
          <Notifications />
        </MantineProvider>
      </body>
    </html>,
  );

  const containerTitle = getByTestId(container, "loading-title");
  expect(containerTitle).not.toBeNull();
  expect(containerTitle!.textContent).toBe(Program.name);
  const containerMessage = getByTestId(container, "loading-message");
  expect(containerMessage).not.toBeNull();
  expect(containerMessage!.textContent).toBe(message);
});
