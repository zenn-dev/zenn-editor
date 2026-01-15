import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node18',
  // CJS専用パッケージをバンドルに含める（フロントエンドでのCJS/ESM interop問題を回避）
  noExternal: ['markdown-it-task-lists', 'markdown-it-inline-comments'],
});
