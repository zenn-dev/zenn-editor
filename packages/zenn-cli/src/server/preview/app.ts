import express from 'express';
import path from 'path';
import history from 'connect-history-api-fallback';
import { getArticle, getArticles } from './api/articles';
import { getBook, getBooks, getChapter, getChapters } from './api/books';
import { getCliGuide } from './api/cli-guide';
import { getLocalInfo } from './api/local-info';
import { getCliVersion } from './api/cli-version';

export function createApp() {
  const app = express();
  app.get('/api/example', function (req, res) {
    res.send('example');
  });

  app.get(`/api/articles`, getArticles);
  app.get(`/api/articles/:slug`, getArticle);
  app.get(`/api/books`, getBooks);
  app.get(`/api/books/:slug`, getBook);
  app.get(`/api/books/:book_slug/chapters`, getChapters);
  app.get(`/api/books/:book_slug/chapters/:chapter_filename`, getChapter);
  app.get(`/api/cli-guide`, getCliGuide);
  app.get(`/api/cli-version`, getCliVersion);
  app.get(`/api/local-info`, getLocalInfo);

  // serve static files built by vite
  app.use(history()); // required to directly access non-root pages such as /guide, /articles/foo

  app.use(
    express.static(path.join(__dirname, '../../client'), {
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      },
    })
  );

  return app;
}
