// for preview client
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';

const srcDirRoot = 'src/client';
const distDirRoot = 'dist/client';

export default defineConfig({
  root: path.join(__dirname, srcDirRoot),
  publicDir: path.join(__dirname, `${srcDirRoot}/public`),
  build: {
    outDir: path.join(__dirname, distDirRoot),
  },
  plugins: [reactRefresh()],
  // for developing preview
  server: {
    port: 3333,
    proxy: {
      '^/(api|images)/.*': {
        target: 'http://localhost:8000',
      },
    },
    fs: {
      allow: [path.join(__dirname, '..')],
    },
  },
  // required to resolve monorepo packages from vite
  // ref: https://github.com/vitejs/vite/issues/1491
  resolve: {
    alias: {
      'zenn-embed-elements': 'zenn-embed-elements/src/index.ts',
    },
  },
});
