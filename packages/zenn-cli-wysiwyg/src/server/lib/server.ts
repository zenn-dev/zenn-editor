import type { Express } from 'express';
import { createServer } from 'http';
import type { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import open from 'open';
import { getWorkingPath, resolveHostname } from './helper';
import fs from 'fs';
import path from 'path';
import { Article } from 'zenn-model';
import { glob } from 'node:fs/promises';
import { getLocalArticle, stringifyArticleWithMetaData } from './articles';
import {
  WS_ArticleSavedMessage,
  WS_ClientMessage,
  WS_LocalArticleChangedMessage,
} from 'common/types';

type ServerOptions = {
  app: Express;
  port: number;
  shouldOpen: boolean;
  hostname?: string;
};

export async function startServer(options: ServerOptions): Promise<HttpServer> {
  const { app, port, hostname, shouldOpen } = options;
  const server = createServer(app);

  return new Promise((resolve, reject) => {
    server
      .listen(port, hostname)
      .once('listening', function () {
        if (process.env.TS_NODE_DEV) {
          console.log('🚀 Server is ready.');
        } else {
          const { name, host } = resolveHostname(hostname);

          console.log(`👀 Preview: http://${name}:${port}`);
          if (host) console.log(`🌏 NetWork: http://${host}:${port}`);
        }
        if (shouldOpen) open(`http://localhost:${port}`);
        resolve(server);
      })
      .once('error', async function (err) {
        if (err.message.includes('EADDRINUSE')) {
          console.log(
            `💡 ポート${port}は既に使用されています。別のポートで起動中…`
          );
          const server = await startServer({ ...options, port: port + 1 });
          resolve(server);
        } else {
          reject(err);
        }
      });
  });
}

export async function startLocalChangesWatcher(
  server: HttpServer,
  watchPathGlob: string
) {
  const wss = new WebSocketServer({ server });
  const watcher = chokidar.watch(await Array.fromAsync(glob(watchPathGlob)));
  watcher.on('change', (path) => {
    if (path.includes('/articles/')) {
      const slug = path.split('/articles/')[1].replace(/\.mdx?$/, '');
      const article = getLocalArticle(slug);
      if (!article) {
        console.error(`記事の取得に失敗しました: ${slug}`);
        return;
      }

      const req: WS_LocalArticleChangedMessage = {
        type: 'localArticleFileChanged',
        data: { article },
      };

      wss.clients.forEach((client) => client.send(JSON.stringify(req)));
    }
  });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      const msg = message.toString();

      const res: WS_ClientMessage = JSON.parse(msg);
      if (res.type === 'contentChanged') {
        const article = res.data.article;

        const outputDir = `${getWorkingPath('')}/articles`;
        const outputFile = path.join(outputDir, `${res.data.article.slug}.md`);

        const contentWithMeta = stringifyArticleWithMetaData(article);

        watcher.unwatch(await Array.fromAsync(glob(watchPathGlob)));
        fs.writeFileSync(outputFile, contentWithMeta ?? '', 'utf-8');
        watcher.add(await Array.fromAsync(glob(watchPathGlob)));

        const updatedArticle = getLocalArticle(article.slug);
        if (!updatedArticle) {
          console.error(`記事の取得に失敗しました: ${article.slug}`);
          return;
        }

        const req: WS_ArticleSavedMessage = {
          type: 'articleSaved',
          data: { article: updatedArticle },
        };

        ws.send(JSON.stringify(req));
      }
    });
  });

  process.on('SIGINT', () => {
    // close by `Ctrl-C`
    wss.close();
    watcher.close();
    process.exit();
  });
}
