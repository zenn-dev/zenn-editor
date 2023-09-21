/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'esnext',
  },

  test: {
    include: ['./__tests__/**/*.test.ts'],
  },
});
