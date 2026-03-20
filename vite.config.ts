import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8080",
            },
            "/socket.io": {
                target: "http://localhost:8080",
                ws: true,
            },
        },
    },
    preview: {
        port: 3000,
    },
    build: {
        outDir: "build",
        emptyOutDir: true,
    },
});
