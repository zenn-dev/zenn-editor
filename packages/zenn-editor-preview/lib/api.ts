import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

const articlesDirectory = join(process.cwd(), "articles");

function getAllArticleSlugs(): string[] {
  return getArticleMdNames()?.map((n) => n.replace(/\.md$/, ""));
}

function getArticleMdNames(): string[] {
  const allFiles = fs.readdirSync(articlesDirectory);
  const mdRegex = /\.md$/;
  return allFiles?.filter((f) => f.match(mdRegex));
}

// todo: return type
export function getArticleBySlug(slug: string, fields: string[] = []): any {
  const fullPath = join(articlesDirectory, `${slug}.md`);
  const fileRaw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileRaw);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = slug;
    }
    if (field === "content") {
      items[field] = content;
    }
    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllArticles(fields = []) {
  const slugs = getAllArticleSlugs();
  const articles = slugs.map((slug) => getArticleBySlug(slug, fields));
  return articles;
}
