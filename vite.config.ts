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
    resolve: {
      alias: {
        "@": resolve(__dirname, "src")
      }
    },
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
        // FIX: Match exact file names mapped in package.json exports block
        fileName: (format: string) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        formats: ['es', 'cjs'] // Explicitly force both module formats
      },
      rollupOptions: {
        // FIX: Add 'react/jsx-runtime' to prevent compiling duplicate React code
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: { 
          globals: { 
            react: 'React', 
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'JSX'
          } 
        }
      }
    };
  }

  return config;
});
