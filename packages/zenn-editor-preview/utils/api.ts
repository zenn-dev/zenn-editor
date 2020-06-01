import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

import { Article, Book } from "@types";

const articlesDirectory = join(process.cwd(), "articles");

function getAllArticleSlugs(): string[] {
  return getArticleMdNames()?.map((n) => n.replace(/\.md$/, ""));
}

function getArticleMdNames(): string[] {
  let allFiles;
  try {
    allFiles = fs.readdirSync(articlesDirectory);
  } catch (e) {
    throw new Error("articlesディレクトリを作成してください");
  }
  const mdRegex = /\.md$/;
  return allFiles?.filter((f) => f.match(mdRegex));
}

export function getArticleBySlug(
  slug: string,
  fields?: null | string[]
): Article {
  const fullPath = join(articlesDirectory, `${slug}.md`);
  let fileRaw;
  try {
    fileRaw = fs.readFileSync(fullPath, "utf8");
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
      if (field === "content") {
        item[field] = content;
      }
      if (data[field]) {
        item[field] = data[field];
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

export function getAllArticles(fields = []) {
  const slugs = getAllArticleSlugs();
  const articles = slugs.map((slug) => getArticleBySlug(slug, fields));
  return articles;
}

// books
const booksDirectory = join(process.cwd(), "books");

export function getBookDirNames(): string[] {
  let allDirs;
  try {
    allDirs = fs.readdirSync(booksDirectory);
  } catch (e) {
    throw new Error("booksディレクトリを作成してください");
  }
  // return dirs only
  return allDirs?.filter((f) =>
    fs.statSync(join(booksDirectory, f)).isDirectory()
  );
}

export function getAllBookSlugs(): string[] {
  return getBookDirNames();
}

export function getAllBooks(fields = []): Book[] {
  const slugs = getAllBookSlugs();
  const books = slugs.map((slug) => getBookBySlug(slug, fields));
  return books;
}

export function getBookBySlug(slug: string, fields?: null | string[]): Book {
  const fullDirPath = join(booksDirectory, slug);
  let fileRaw;

  try {
    fileRaw = fs.readFileSync(`${fullDirPath}/config.yaml`, "utf8");
  } catch (e) {
    try {
      fileRaw = fs.readFileSync(`${fullDirPath}/config.yml`, "utf8");
    } catch (e) {}
  }
  if (!fileRaw)
    return {
      slug,
    };

  const data = yaml.safeLoad(fileRaw);

  // return only specified fields
  if (fields) {
    const item: Article = {
      slug,
    };
    fields.forEach((field) => {
      if (data[field]) {
        item[field] = data[field];
      }
    });
    return item;
  } else {
    // or return all
    return {
      slug,
      ...data,
    };
  }
}
