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
  esbuildPlugins: [
    {
      name: 'add-banner',
      setup(build) {
        build.onEnd((result) => {
          const file = result.outputFiles?.find((f) =>
            f.path.endsWith('zenn.js')
          );
          if (!file) throw new Error('zenn.js not exists');

          const text = `#!/usr/bin/env node\n${file.text}`;
          file.contents = Buffer.from(text);
        });
      },
    },
  ],
});
