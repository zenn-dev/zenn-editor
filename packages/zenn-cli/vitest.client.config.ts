/// <reference types="vitest" />

import react from '@vitejs/plugin-react'; // React の auto import jsx を有効にするプラグイン
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'esnext',
  },

  plugins: [react()],

  test: {
    environment: 'jsdom',
    include: [
      './src/client/__tests__/**/*.test.ts',
      './src/common/__tests__/**/*.test.ts',
    ],
  },
});
