import { parseFrontMatter } from './front-matter';
import * as Log from './log';

import {
  listFilenames,
  listFilenamesOrderByModified,
  getFileRaw,
  getWorkingPath,
  completeHtml,
} from './helper';
import { Article, ArticleMeta } from 'zenn-model';
import { ItemSortType } from '../../common/types';
import markdownToHtml from 'zenn-markdown-html';
import { parseToc } from 'zenn-markdown-html/utils';
import { getMarkdownOptions } from './markdown-options';

export async function getLocalArticle(slug: string): Promise<null | Article> {
  const data = readArticleFile(slug);
  if (!data) return null;
  const { meta, bodyMarkdown } = data;
  const rawHtml = await markdownToHtml(bodyMarkdown, getMarkdownOptions());
  const bodyHtml = completeHtml(rawHtml);
  const toc = parseToc(bodyHtml);
  return {
    ...meta,
    bodyHtml,
    toc,
  };
}

export function getLocalArticleMetaList(sort?: ItemSortType): ArticleMeta[] {
  const slugs = getArticleSlugs(sort);
  const articles = slugs
    ? slugs
        .map((slug) => getArticleMetaData(slug))
        .filter((article): article is ArticleMeta => article !== null)
    : [];
  return articles;
}

function getArticleSlugs(sort?: ItemSortType): string[] {
  return getArticleFilenames(sort).map((n) => n.replace(/\.md$/, ''));
}

function getArticleFilenames(sort?: ItemSortType): string[] {
  const dirpath = getWorkingPath('articles');
  const allFiles =
    sort === 'system'
      ? listFilenames(dirpath)
      : listFilenamesOrderByModified(dirpath);
  if (allFiles === null) {
    Log.error(
      'プロジェクトルートの articles ディレクトリを取得できませんでした。`npx zenn init`を実行して作成してください'
    );
    return [];
  }
  // filter markdown files
  return allFiles.filter((f) => /\.md$/.test(f)); // `.md`で終わるファイルのみに絞り込む
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

  const { data, content: bodyMarkdown } = parseFrontMatter(raw);
  return {
    meta: {
      ...data,
      slug,
    } as ArticleMeta,
    bodyMarkdown,
  };
}
