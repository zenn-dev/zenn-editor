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
  loader: {
    // Tsup が CSS Module を対応していないため、cssファイルを全て local-css として扱う.
    // グローバル変数にしたいものは :global() で囲む.
    // https://github.com/egoist/tsup/issues/536
    '.css': 'local-css',
  },
  format: ['esm'],
});
