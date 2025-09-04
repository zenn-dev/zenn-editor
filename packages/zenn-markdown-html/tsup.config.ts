import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.build.json',
  outDir: 'lib',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm'],
});
