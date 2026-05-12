/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^zenn-markdown-html\/utils$/,
        replacement: new URL(
          '../zenn-markdown-html/src/utils/index.ts',
          import.meta.url
        ).pathname,
      },
      {
        find: /^zenn-markdown-html$/,
        replacement: new URL(
          '../zenn-markdown-html/src/index.ts',
          import.meta.url
        ).pathname,
      },
    ],
  },
  test: {
    include: ['./src/server/__tests__/**/*.test.ts'],
  },
});
