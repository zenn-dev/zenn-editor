import Express from 'express';

import { getLocalArticle, getLocalArticleMetaList } from '../lib/articles';
import { getValidSortTypes } from '../../common/helper';

export function getArticle(req: Express.Request, res: Express.Response) {
  const article = getLocalArticle(req.params.slug);
  if (!article) {
    res
      .status(404)
      .json({ message: '記事のマークダウンを取得できませんでした' });
    return;
  }
  res.json({ article });
}

export function getArticles(req: Express.Request, res: Express.Response) {
  const sort = getValidSortTypes(req.query.sort);
  const articles = getLocalArticleMetaList(sort);
  res.json({ articles });
}
