/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'esnext',
  },

  test: {
    environment: 'jsdom',
    include: ['./src/server/__tests__/**/*.test.ts'],
  },
});
