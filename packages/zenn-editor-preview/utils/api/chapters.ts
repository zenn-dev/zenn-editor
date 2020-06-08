import fs from "fs-extra";
import { join } from "path";
import matter from "gray-matter";
import { Chapter } from "@types";
import { throwWithConsoleError } from "@utils/errors";

function getBookDirPath(bookSlug: string): string {
  return join(process.cwd(), "books", bookSlug);
}

export function getChapterMdNames(bookSlug: string): string[] {
  let allChapters;
  try {
    allChapters = fs.readdirSync(getBookDirPath(bookSlug));
  } catch (e) {
    throwWithConsoleError(
      `books/${bookSlug}ディレクトリを取得できませんでした`
    );
  }
  // return md only
  const mdRegex = /\.md$/;
  return allChapters?.filter((f) => f.match(mdRegex));
}

// ["1.md", "2.md"] => ["1","2"]
export function getChapterPositionStrings(bookSlug: string): string[] {
  return getChapterMdNames(bookSlug)?.map((n) => n.replace(/\.md$/, ""));
}

export function getChapters(
  bookSlug: string,
  fields: null | string[]
): Chapter[] {
  const positions = getChapterPositionStrings(bookSlug);
  const books = positions.map((position) =>
    getChapter(bookSlug, position, fields)
  );
  return books;
}

export function getChapter(
  bookSlug: string,
  position: string,
  fields?: null | string[]
): Chapter {
  const fullPath = join(getBookDirPath(bookSlug), `${position}.md`);
  let fileRaw;
  try {
    fileRaw = fs.readFileSync(fullPath, "utf8");
  } catch (e) {
    return null;
  }

  const { data, content } = matter(fileRaw);

  // return only specified fields
  if (fields) {
    const item: Chapter = {
      position,
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
      position,
      content,
      ...data,
    };
  }
}
