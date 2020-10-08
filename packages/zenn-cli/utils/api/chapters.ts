import fs from "fs-extra";
import path from "path";
import matter from "gray-matter";
import { Chapter, ChapterMeta } from "@types";
import { throwWithConsoleError } from "@utils/errors";

function getBookDirPath(bookSlug: string): string {
  return path.join(process.cwd(), "books", bookSlug);
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

// ["1.md", "something.md"] => ["1","something"]
export function getChapterSlugList(bookSlug: string) {
  return getChapterMdNames(bookSlug)?.map((n) => n.replace(/\.md$/, ""));
}

export function getChapters(
  bookSlug: string,
  configYamlChapters?: null | string[]
): ChapterMeta[] {
  const slugs = getChapterSlugList(bookSlug);

  const configYamlChapterSlugList = configYamlChapters?.map((slug) => {
    if (/ - /.test(slug) || typeof slug !== "string") {
      console.error(
        "🚩 config.yamlの「chapters」には一次元配列のみ指定できます。ネストすることはできません"
      );
    }
    return slug.replace(/\.md/, "");
  });

  if (configYamlChapterSlugList?.length) {
    return slugs
      .map((slug) => {
        const slugIndex = configYamlChapterSlugList.indexOf(slug);
        return {
          position: slugIndex < 0 ? null : slugIndex + 1,
          ...getChapterMeta(bookSlug, slug),
        };
      })
      .sort((a, b) => Number(a.position) - Number(b.position));
  }

  // 👇 deprecated way (1.md, 2.md, 3.md ....)
  return slugs
    .sort((a, b) => Number(a) - Number(b))
    .map((slug, index) => {
      return {
        position: index + 1,
        ...getChapter(bookSlug, slug),
      };
    });
}

function readChapterFile(bookSlug: string, chapterSlug: string) {
  const fullPath = path.join(
    getBookDirPath(bookSlug.replace(/[/\\]/g, "")), // Prevent directory traversal
    `${chapterSlug.replace(/[/\\]/g, "")}.md`
  );
  let fileRaw;
  try {
    fileRaw = fs.readFileSync(fullPath, "utf8");
  } catch (e) {
    return null;
  }

  const { data, content } = matter(fileRaw);
  return { data, content };
}

export function getChapter(
  bookSlug: string,
  chapterSlug: string
): null | Chapter {
  const chapterData = readChapterFile(bookSlug, chapterSlug);
  if (!chapterData) return null;

  return {
    slug: chapterSlug,
    content: chapterData.content,
    ...chapterData.data,
  } as Chapter;
}

export function getChapterMeta(
  bookSlug: string,
  chapterSlug: string
): ChapterMeta {
  const chapterData = readChapterFile(bookSlug, chapterSlug);
  if (!chapterData) return null;

  return {
    slug: chapterSlug,
    ...chapterData.data,
  } as ChapterMeta;
}
