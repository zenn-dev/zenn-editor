import fs from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { Book } from "@types";

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

export function getAllBooks(fields: string[] = []): Book[] {
  const slugs = getAllBookSlugs();
  const books = slugs.map((slug) => getBookBySlug(slug, fields) || { slug });
  return books;
}

function getConfigYamlData(fullDirPath: string): Book {
  let fileRaw;
  try {
    // try to get config.yaml
    fileRaw = fs.readFileSync(`${fullDirPath}/config.yaml`, "utf8");
  } catch (e) {
    // try to get config.yml
    try {
      fileRaw = fs.readFileSync(`${fullDirPath}/config.yml`, "utf8");
    } catch (e) {}
  }
  // couldn't get yaml files
  if (!fileRaw) {
    return null;
  }
  try {
    return yaml.safeLoad(fileRaw);
  } catch (e) {
    // couldn't load yaml files
    throw new Error(
      `config.yamlの表記に誤りがあります😿\n ${fullDirPath}/config.yaml`
    );
  }
}

export function getBookBySlug(slug: string, fields?: null | string[]): Book {
  const fullDirPath = join(booksDirectory, slug);
  const data = getConfigYamlData(fullDirPath);
  if (!data) return null;

  // return only specified fields
  if (fields) {
    const item: Book = {
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
