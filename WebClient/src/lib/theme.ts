import { createTheme, MantineColorScheme, MantineColorsTuple, MantineThemeOverride } from "@mantine/core";

// Add function to get initial color scheme
function getInitialColorScheme(): MantineColorScheme {
  if (typeof window !== "undefined") {
    try {
      const theme = localStorage.getItem("user-preferences");
      if (theme) {
        const { darkMode } = JSON.parse(theme);
        return darkMode ? "dark" : "light";
      }
    } catch (e) {
      console.error("Error reading theme:", e);
    }
  }
  return "light";
}

export const defaultColorscheme = "light";
const defaultColors: MantineColorsTuple = [
  "#dffbff",
  "#caf2ff",
  "#99e2ff",
  "#64d2ff",
  "#3cc4fe",
  "#23bcfe",
  "#00b5ff",
  "#00a1e4",
  "#008fcd",
  "#007cb6",
];

// Your theme configuration is merged with default theme
export const theme: MantineThemeOverride = createTheme({
  // FIXME: fonts are not working as expected
  // fontFamily: "Manrope, sans-serif",
  // fontFamilyMonospace: "JetBrains Mono, monospace",
  defaultRadius: "md",
  colors: { defaultColors },
});
