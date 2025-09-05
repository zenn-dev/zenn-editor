import { defineConfig } from 'tsup';
import { prismjsPlugin } from 'esbuild-plugin-prismjs';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm'],
  esbuildPlugins: [prismjsPlugin({ languages: 'all' })],
});
