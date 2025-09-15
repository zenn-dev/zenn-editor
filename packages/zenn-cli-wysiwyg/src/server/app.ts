import express from 'express';
import path from 'path';
import history from 'connect-history-api-fallback';
import { getArticle, getArticles } from './api/articles';
import { getBook, getBooks, getChapter, getChapters } from './api/books';
import { getCliGuide } from './api/cli-guide';
import { getLocalInfo } from './api/local-info';
import { getCliVersion } from './api/cli-version';
import { postImage } from './api/images';
import { getWorkingPath } from './lib/helper';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, `images/`);
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, uniqueSuffix + '.' + ext);
  },
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

export function createApp() {
  const app = express();
  app.get(`/api/articles`, getArticles);
  app.get(`/api/articles/:slug`, getArticle);
  app.get(`/api/books`, getBooks);
  app.get(`/api/books/:slug`, getBook);
  app.get(`/api/books/:book_slug/chapters`, getChapters);
  app.get(`/api/books/:book_slug/chapters/:chapter_filename`, getChapter);
  app.get(`/api/cli-guide/:slug`, getCliGuide);
  app.get(`/api/cli-version`, getCliVersion);
  app.get(`/api/local-info`, getLocalInfo);
  app.post(`/api/images`, upload.single('image'), postImage);

  app.get('/images/*', (req, res) => {
    // `zenn preview`を起動したディレクトリ直下にあるimagesディレクトリを参照する
    // URLエンコードされた文字（%20など）をデコード
    const decodedPath = decodeURIComponent(req.path);
    res.sendFile(getWorkingPath(decodedPath));
  });

  // serve static files built by vite
  app.use(history()); // required to directly access non-root pages such as /guide, /articles/foo

  app.use(
    express.static(path.join(__dirname, '../client'), {
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      },
    })
  );

  return app;
}
