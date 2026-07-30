import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from "@tailwindcss/vite";
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  // 1. Shared rules for all workflows
  const config: any = {
    plugins: [
      react(),
      tailwind(),
    ],
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
        fileName: (format: string) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        formats: ['es', 'cjs']
      },
      rollupOptions: {
        external: [
          'react', 
          'react-dom', 
          'react/jsx-runtime', 
          'next',
          /^next\/.*/,
          'lucide-react'
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'JSX',
            'lucide-react': 'LucideReact',
            'next': "Next",
            'next/navigation': "NextNavigation"
          }
        }
      }
    };
  }

  return config;
});
