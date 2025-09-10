import { defineConfig } from 'tsup';

// zenn-* は devDependencies にしてバンドルに含める
export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  platform: 'browser',
  format: ['esm'],
});
