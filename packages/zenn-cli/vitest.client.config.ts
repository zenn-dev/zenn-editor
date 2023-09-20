/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'esnext',
  },

  test: {
    environment: 'jsdom',
    include: [
      './src/client/__tests__/**/*.test.ts',
      './src/common/__tests__/**/*.test.ts',
    ],
  },
});