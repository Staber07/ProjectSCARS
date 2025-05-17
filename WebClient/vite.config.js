import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./vitest.setup.mjs",
    },
    plugins: [
        tsconfigPaths(),
        react(),
    ],
});
