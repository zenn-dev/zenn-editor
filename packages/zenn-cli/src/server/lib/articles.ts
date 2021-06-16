import matter from 'gray-matter';
import * as Log from './log';

import {
  listFilenamesOrderByModified,
  getFileRaw,
  getWorkingPath,
} from './helper';
import { Article, ArticleMeta } from '../../common/types';
import markdownToHtml from 'zenn-markdown-html';

export function getLocalArticle(slug: string): null | Article {
  const data = readArticleFile(slug);
  if (!data) return null;
  const { meta, bodyMarkdown } = data;
  const bodyHtml = markdownToHtml(bodyMarkdown);
  return {
    ...meta,
    bodyHtml,
  };
}

export function getLocalArticleMetaList(): ArticleMeta[] {
  const slugs = getArticleSlugs();
  const articles = slugs
    ? slugs
        .map((slug) => getArticleMetaData(slug))
        .filter((article): article is ArticleMeta => article !== null)
    : [];
  return articles;
}

function getArticleSlugs(): string[] {
  return getArticleFilenames().map((n) => n.replace(/\.md$/, ''));
}

function getArticleFilenames(): string[] {
  const dirpath = getWorkingPath('articles');
  const allFiles = listFilenamesOrderByModified(dirpath);
  if (allFiles === null) {
    Log.error(
      'プロジェクトルートの articles ディレクトリを取得できませんでした。`npx zenn init`を実行して作成してください'
    );
    return [];
  }
  return allFiles ? allFiles.filter((f) => f.match(/\.md$/)) : []; // filter markdown files
}

function getArticleMetaData(slug: string): null | ArticleMeta {
  const data = readArticleFile(slug);
  return data ? data.meta : null;
}

function readArticleFile(slug: string) {
  const fullpath = getWorkingPath(`articles/${slug}.md`);
  const raw = getFileRaw(fullpath);
  if (!raw) {
    Log.error(`${fullpath}の内容を取得できませんでした`);
    return null;
  }
  const { data, content: bodyMarkdown } = matter(raw);
  return {
    meta: {
      ...data,
      slug,
    } as ArticleMeta,
    bodyMarkdown,
  };
}
