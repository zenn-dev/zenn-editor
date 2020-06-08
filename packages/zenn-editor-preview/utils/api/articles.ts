import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { Article } from "@types";
import { throwWithConsoleError } from "@utils/errors";

const articlesDirectory = join(process.cwd(), "articles");

function getAllArticleSlugs(): string[] {
  return getArticleMdNames()?.map((n) => n.replace(/\.md$/, ""));
}

function getArticleMdNames(): string[] {
  let allFiles;
  try {
    allFiles = fs.readdirSync(articlesDirectory);
  } catch (e) {
    throwWithConsoleError(
      "プロジェクトルートにarticlesディレクトリを作成してください"
    );
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

export function getAllArticles(fields: string[] = []) {
  const slugs = getAllArticleSlugs();
  const articles = slugs.map((slug) => getArticleBySlug(slug, fields));
  return articles;
}
