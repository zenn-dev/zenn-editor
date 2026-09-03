/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: [
      './src/client/__tests__/**/*.test.{ts,tsx}',
      './src/common/__tests__/**/*.test.ts',
    ],
  },
});
