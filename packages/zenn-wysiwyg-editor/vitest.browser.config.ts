import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'prismjs',
            {
              languages: 'all',
              plugins: ['diff-highlight'],
            },
          ],
        ],
      },
    }),
  ],
  test: {
    setupFiles: ['./setup-browser-test.ts'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
    // ブラウザ環境でのテスト（DOM操作、TiptapのEditor等）
    include: ['src/**/*.browser.spec.ts', 'src/**/*.browser.spec.tsx'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
