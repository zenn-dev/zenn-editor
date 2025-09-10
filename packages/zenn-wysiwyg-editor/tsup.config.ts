import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  noExternal: ['zenn-markdown-html'],
  platform: 'browser',
  format: ['esm'],
});
