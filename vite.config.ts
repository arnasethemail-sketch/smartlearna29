/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/smartlearna29/",
  plugins: [react()],
  test: {
    testTimeout: 20_000,
  },
});
