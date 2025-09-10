import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

// zenn-* は devDependencies にしてバンドルに含める (zenn-wysiwyg-editor を除く)
export default defineConfig({
  entry: ['./src/server/zenn.ts'],
  tsconfig: './tsconfig.server.json',
  outDir: 'dist/server',
  clean: true,
  sourcemap: true,
  format: ['cjs'],
  env: { ...dotenv.config().parsed, NODE_ENV: 'production' },
  banner: {
    js: '#!/usr/bin/env node\n',
  },
});
