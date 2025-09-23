import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

const BANNER = `#!/usr/bin/env node
const semver = require("semver");

if (!semver.satisfies(process.version, ">=20.0.0")) {
  console.error(\`Node.js v20.0.0 以上が必要です。現在のバージョン: \${process.version}\`);
  process.exit(1);
}`;

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
    js: BANNER,
  },
});
