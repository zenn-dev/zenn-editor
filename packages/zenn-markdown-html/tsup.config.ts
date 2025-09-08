import { defineConfig } from 'tsup';
import { prismjsPlugin } from 'esbuild-plugin-prismjs';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.json',
  outDir: 'lib',
  dts: true,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  esbuildPlugins: [prismjsPlugin({ languages: 'all' })],
  noExternal: ['prismjs'], // プラグインを起動するためバンドルに含める
});
