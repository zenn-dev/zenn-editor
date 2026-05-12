/// <reference types="vitest" />

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^zenn-markdown-html\/utils$/,
        replacement: fileURLToPath(
          new URL('../zenn-markdown-html/src/utils/index.ts', import.meta.url)
        ),
      },
      {
        find: /^zenn-markdown-html$/,
        replacement: fileURLToPath(
          new URL('../zenn-markdown-html/src/index.ts', import.meta.url)
        ),
      },
    ],
  },
  test: {
    include: ['./src/server/__tests__/**/*.test.ts'],
  },
});
