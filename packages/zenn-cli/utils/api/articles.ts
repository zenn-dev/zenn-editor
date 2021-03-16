import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { Article } from '../../types';
import { throwWithConsoleError } from '../errors';

const articlesDirectory = path.join(process.cwd(), 'articles');

function getAllArticleSlugs(): string[] {
  return getArticleMdNames()?.map((n) => n.replace(/\.md$/, ''));
}

function getArticleMdNames(): string[] {
  let allFiles;
  try {
    allFiles = fs.readdirSync(articlesDirectory);
  } catch (e) {
    throwWithConsoleError(
      'プロジェクトルートにarticlesディレクトリがありません。`npx zenn init`を実行してください'
    );
  }
  const mdRegex = /\.md$/;
  return allFiles ? allFiles.filter((f) => f.match(mdRegex)) : [];
}

export function getArticleBySlug(
  slug: string,
  fields?: null | (keyof Article)[]
): null | Article {
  const fullPath = path.join(
    articlesDirectory,
    `${slug.replace(/[/\\]/g, '')}.md` // Prevent directory traversal
  );
  let fileRaw;
  try {
    fileRaw = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    return null;
  }

  const { data, content } = matter(fileRaw);

  // return only specified fields
  if (fields) {
    const item: any = {
      slug,
    };
    fields.forEach((field) => {
      if (field === 'content') {
        item[field] = content;
      }
      if (data[field] !== undefined) {
        item[field as string] = data[field];
      }
    });
    return item as Article;
  } else {
    // or return all
    return {
      slug,
      content,
      ...data,
    } as Article;
  }
}

export function getAllArticles(fields: (keyof Article)[] = []): Article[] {
  const slugs = getAllArticleSlugs();
  const articles = slugs
    .map((slug) => getArticleBySlug(slug, fields))
    .filter((data): data is Article => data !== null);
  return articles;
}
