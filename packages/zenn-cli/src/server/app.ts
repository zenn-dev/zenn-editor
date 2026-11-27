import express, { type RequestHandler } from 'express';
import path from 'path';
import { getArticle, getArticles } from './api/articles';
import { getBook, getBooks, getChapter, getChapters } from './api/books';
import { getManual } from './api/manual';
import { getLocalInfo } from './api/local-info';
import { getCliVersion } from './api/cli-version';
import { historyApiFallback } from './lib/history-fallback';

/** `zenn preview`を起動したディレクトリ直下にある、指定したディレクトリのファイルを返す */
function serveLocalDirectory(dirName: 'images' | 'files'): RequestHandler {
  return (req, res) => {
    let decodedPath: string;
    try {
      // URLエンコードされた文字（%20など）をデコード
      decodedPath = decodeURIComponent(req.path.slice(`/${dirName}/`.length));
    } catch {
      // 不正なパーセントエンコード
      res.status(400).end();
      return;
    }
    // デコード後に `..` セグメントが混ざっていれば早期に弾く
    if (decodedPath.split(/[\\/]+/).some((seg) => seg === '..')) {
      res.status(400).end();
      return;
    }
    // rootをcwd/<dirName>に固定する。rootをcwdにするとsendのUP_PATH_REGEXPチェックが
    // cwd脱出時にしか効かず、`images/../package.json` のようなcwd配下への脱出を許して
    // しまう。加えて、rootを固定することでsendのdotfilesチェックはそのディレクトリ配下
    // の相対パスにのみ適用され、親ディレクトリが`.`で始まる場合（例: `~/.ghq/...`）で
    // もファイルを配信できる。
    res.sendFile(decodedPath, {
      root: path.join(process.cwd(), dirName),
      dotfiles: 'ignore',
    });
  };
}

export function createApp() {
  const app = express();
  app.get(`/api/articles`, getArticles);
  app.get(`/api/articles/:slug`, getArticle);
  app.get(`/api/books`, getBooks);
  app.get(`/api/books/:slug`, getBook);
  app.get(`/api/books/:book_slug/chapters`, getChapters);
  app.get(`/api/books/:book_slug/chapters/:chapter_filename`, getChapter);
  app.get(`/api/manual/:slug`, getManual);
  app.get(`/api/cli-version`, getCliVersion);
  app.get(`/api/local-info`, getLocalInfo);

  // `zenn preview`を起動したディレクトリ直下にあるimagesディレクトリ（画像）と
  // filesディレクトリ（画像・音声）を配信する
  app.get('/images/*splat', serveLocalDirectory('images'));
  app.get('/files/*splat', serveLocalDirectory('files'));

  // serve static files built by vite
  // historyApiFallbackがないと `/articles/foo` などの非ルートページでリロードすると404エラーになる
  app.use(historyApiFallback());

  app.use(
    express.static(path.join(__dirname, '../client'), {
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      },
    })
  );

  return app;
}
