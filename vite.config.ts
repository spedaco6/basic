import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  // 1. Shared rules for all workflows
  const config: any = {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}']
    }
  };

  // 2. Route execution flow
  if (command === 'serve' && !process.env.VITEST) {
    config.root = 'dev'; // Mounts local browser playground
  } else {
    config.build = {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Basic',
        fileName: (format: string) => `index.${format}.js`
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } }
      }
    };
  }

  return config;
});
