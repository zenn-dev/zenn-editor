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
      'プロジェクトルートにarticlesディレクトリを作成してください'
    );
  }
  const mdRegex = /\.md$/;
  return allFiles?.filter((f) => f.match(mdRegex));
}

export function getArticleBySlug(
  slug: string,
  fields?: null | (keyof Article)[]
): Article {
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
    const item: Article = {
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
    return item;
  } else {
    // or return all
    return {
      slug,
      content,
      ...data,
    };
  }
}

export function getAllArticles(fields: (keyof Article)[] = []) {
  const slugs = getAllArticleSlugs();
  const articles = slugs.map((slug) => getArticleBySlug(slug, fields));
  return articles;
}
