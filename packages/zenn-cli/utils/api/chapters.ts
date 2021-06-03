import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { Chapter, ChapterMeta } from '../../types';
import { getBookBySlug } from './books';
import { throwWithConsoleError } from '../errors';

function getBookDirPath(bookSlug: string): string {
  return path.join(process.cwd(), 'books', bookSlug);
}

function getChapterFilenames(bookSlug: string): string[] {
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

export function getChapterMetas(
  bookSlug: string,
  configYamlChapters?: null | string[]
): ChapterMeta[] {
  const chapterFilenames = getChapterFilenames(bookSlug);

  if (configYamlChapters && !Array.isArray(configYamlChapters)) {
    throw '🚩 config.yamlのchaptersには配列のみを指定できます';
  }

  const configYamlChapterSlugList = configYamlChapters?.map((slug) => {
    if (/ - /.test(slug) || typeof slug !== 'string') {
      console.error(
        '🚩 config.yamlの「chapters」には一次元配列のみ指定できます。ネストすることはできません'
      );
    }
    return slug.replace(/\.md$/, '');
  });

  // config.yamlにchaptersが設定されている場合
  if (configYamlChapterSlugList?.length) {
    return chapterFilenames
      .map((chapterFilename) => {
        const basename = chapterFilename.replace(/\.md$/, '');
        const slugIndex = configYamlChapterSlugList.indexOf(basename);
        return {
          position: slugIndex < 0 ? null : slugIndex + 1,
          ...getChapterMeta(bookSlug, basename, chapterFilename),
        };
      })
      .sort((a, b) => Number(a.position) - Number(b.position));
  }

  // config.yamlにchaptersが設定されていない場合
  return chapterFilenames
    .filter((filename) => filename.match(/^[0-9]+\..*\.md$/))
    .map((chapterFilename) => {
      const slug = chapterFilename
        .replace(/^[0-9]+\./, '')
        .replace(/\.md$/, '');
      return {
        position: Number(chapterFilename.match(/^[0-9]+/)),
        ...getChapterMeta(bookSlug, slug, chapterFilename),
      };
    })
    .sort((a, b) => Number(a.position) - Number(b.position));
}

function readChapterFile(bookSlug: string, chapterFilename: string) {
  const fullPath = path.join(
    getBookDirPath(bookSlug.replace(/[/\\]/g, '')),
    chapterFilename.replace(/[/\\]/g, '')
  ); // Prevent directory traversal
  let fileRaw;
  try {
    fileRaw = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    return null;
  }

  const { data, content } = matter(fileRaw);
  return { data, content };
}

export function getChapter(
  bookSlug: string,
  chapterFilename: string
): null | Chapter {
  const book = getBookBySlug(bookSlug);
  const chapterData = readChapterFile(bookSlug, chapterFilename);
  let slug = '';
  if (book.chapters) {
    // config.yamlのchaptersに指定されている場合は末尾の `.md` を取り除いたものをslugとする
    slug = chapterFilename.replace(/\.md$/, '');
  } else {
    // そうでない場合は、 `n.slug.md` から `n.` と `.md` を取り除いたものをslugとする
    slug = chapterFilename.replace(/^[0-9]+\./, '').replace(/\.md$/, '');
  }
  if (!chapterData) return null;

  return {
    filename: chapterFilename,
    slug,
    content: chapterData.content,
    ...chapterData.data,
  } as Chapter;
}

function getChapterMeta(
  bookSlug: string,
  chapterSlug: string,
  chapterFilename: string
): null | ChapterMeta {
  const chapterData = readChapterFile(bookSlug, chapterFilename);
  if (!chapterData) return null;

  return {
    filename: chapterFilename,
    slug: chapterSlug,
    ...chapterData.data,
  } as ChapterMeta;
}
