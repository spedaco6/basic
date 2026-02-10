import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: "./vitest.setup.js",
    globals: true,
    include: [
      '**/*.{test,spec}.?(c|m)[jt]s?(x)'
    ],
  },
})