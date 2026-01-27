// for preview client
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

const srcDirRoot = 'src/client';
const distDirRoot = 'dist/client';

export default defineConfig({
  root: path.join(__dirname, srcDirRoot),
  publicDir: path.join(__dirname, `${srcDirRoot}/public`),
  envDir: __dirname,
  build: {
    outDir: path.join(__dirname, distDirRoot),
    commonjsOptions: {
      include: [/zenn-model/, /node_modules/],
    },
  },
  optimizeDeps: {
    include: ['zenn-model'],
  },
  plugins: [react(), svgr()],
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
