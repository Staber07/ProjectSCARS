import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
    input: {
        path: `${process.env.NEXT_PUBLIC_CENTRAL_SERVER_ENDPOINT}/openapi.json`,
        pagination: { keywords: ["limit", "offset"] },
        // watch: true,
    },
    output: {
        path: "src/lib/api/csclient",
        format: "prettier",
        lint: "eslint",
    },
    plugins: [
        {
            name: "@hey-api/client-fetch",
            runtimeConfigPath: "./src/lib/api/customClient.ts",
        },
    ],
});
