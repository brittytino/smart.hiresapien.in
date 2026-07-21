import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/api/**/*.test.ts'],
    globals: true,
    setupFiles: ['tests/setup/vitest.setup.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'next/server': path.resolve(__dirname, 'node_modules/next/dist/server/web/exports/index.js'),
      'next/headers': path.resolve(__dirname, 'node_modules/next/dist/server/web/exports/index.js'),
    },
  },
});
