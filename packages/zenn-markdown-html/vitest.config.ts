/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';
import babel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    babel({
      filter: /\.(j|t)sx?$/,
      babelConfig: {
        babelrc: false,
        root: './',
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        plugins: [['prismjs', { languages: 'all' }]],
      },
    }),
  ],

  test: {
    environment: 'jsdom',
    include: ['./__tests__/**/*.test.ts'],
  },
});
