import { defineConfig } from 'vitest/config'
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    setupFiles: "./vitest.setup.js",
    globals: true,
    include: [
      '**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
  },
})