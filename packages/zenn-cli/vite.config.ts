// for preview client
import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import initTwitterScriptInner from 'zenn-embed-elements/lib/init-twitter-script-inner';

const srcDirRoot = 'src/client';
const distDirRoot = 'dist/client';

export default defineConfig({
  root: path.join(__dirname, srcDirRoot),
  publicDir: path.join(__dirname, `${srcDirRoot}/public`),
  build: {
    outDir: path.join(__dirname, distDirRoot),
  },
  plugins: [
    reactRefresh(),
    injectHtmlHead(`<script>${initTwitterScriptInner}</script>`), // script for embedding tweets need to be server side rendered.
  ],
  // for developing preview
  server: {
    port: 3333,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
      },
    },
    fsServe: {
      root: path.join(__dirname, '..'),
    },
  },
  // required to resolve monorepo packages from vite
  // ref: https://github.com/vitejs/vite/issues/1491
  alias: {
    'zenn-embed-elements': 'zenn-embed-elements/src/index.ts',
  },
});

function injectHtmlHead(str: string) {
  return {
    name: 'html-head-transform',
    transformIndexHtml(html) {
      return html.replace(`</head>`, `${str}</head>`);
    },
  };
}
