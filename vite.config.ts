import type { InlineConfig } from "vitest";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

declare module "vite" {
  interface UserConfig {
    test?: InlineConfig;
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
