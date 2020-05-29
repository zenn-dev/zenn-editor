import fs from "fs";
import { join } from "path";

const articlesDirectory = join(process.cwd(), "articles");

export function getArticleSlugs() {
  return fs.readdirSync(articlesDirectory);
}

// todo: return type
export function getArticleBySlug(slug: string, fields: string[] = []): any {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(articlesDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  // const { data, content } = matter(fileContents);
  const content = fileContents;

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }
    // if (data[field]) {
    //   items[field] = data[field]
    // }
  });

  return items;
}

export function getAllArticles(fields = []) {
  const slugs = getArticleSlugs();
  const articles = slugs.map((slug) => getArticleBySlug(slug, fields));
  return articles;
}
