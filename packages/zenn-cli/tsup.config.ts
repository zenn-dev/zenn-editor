import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

export default defineConfig({
  entry: ['./src/server/zenn.ts'],
  tsconfig: './tsconfig.server.json',
  outDir: 'dist/server',
  clean: true,
  sourcemap: true,
  format: ['cjs'],
  env: dotenv.config().parsed,
});
