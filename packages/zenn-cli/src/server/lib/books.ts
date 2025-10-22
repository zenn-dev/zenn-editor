import yaml from 'js-yaml';
import path from 'path';
import imageSizeOf from 'image-size';
import matter from 'gray-matter';
import markdownToHtml from 'zenn-markdown-html';
import * as Log from './log';
import {
  listDirnames,
  listDirnamesOrderByModified,
  getImageSize,
  getImageRaw,
  bufferToDataURL,
  getFileRaw,
  listFilenames,
  getWorkingPath,
  completeHtml,
  inferImageTypeFromUrl,
  acceptImageExtensions,
} from './helper';
import { Book, BookMeta, Chapter, ChapterMeta } from 'zenn-model';
import { ItemSortType } from '../../common/types';

export function getLocalBook(slug: string): null | Book {
  const bookMeta = getLocalBookMeta(slug);
  if (!bookMeta) return null;

  const fullDirpath = getBookFullDirpath(slug);
  const filenames = listFilenames(fullDirpath);
  // カバー画像のファイル名候補（"cover" + 対応拡張子）に該当するファイルを探す
  const targetCoverFilename = filenames?.find((filename) =>
    acceptImageExtensions.map((ext) => `cover${ext}`).includes(filename)
  );
  // カバー画像の候補となるファイルは存在しない場合
  if (!targetCoverFilename) return bookMeta;

  const coverData = readCoverFile(path.join(fullDirpath, targetCoverFilename));

  // カバー画像が取得できなかった場合
  if (!coverData) return bookMeta;

  // カバー画像が取得できた場合はカバー画像のデータを含めて返す
  return { ...bookMeta, ...coverData };
}

export function getLocalBookMeta(slug: string) {
  const bookMeta = readBookFile(slug);
  if (!bookMeta) return null;

  const { specifiedChapterSlugs } = bookMeta;
  const errorFilename = `books/${slug}/config.yaml`;

  if (specifiedChapterSlugs) {
    if (!Array.isArray(specifiedChapterSlugs)) {
      Log.error(`${errorFilename}の chapters にはslugの配列のみを指定できます`);
      return null;
    }
    const anyNonStringSlug = specifiedChapterSlugs.some(
      (slug) => typeof slug !== 'string'
    );
    if (anyNonStringSlug) {
      Log.error(
        `${errorFilename}の chapters には文字列のslugのみを含めることができます。`
      );
      return null;
    }
    const anyInvalidFormatSlug = specifiedChapterSlugs.some((slug) =>
      / - /.test(slug)
    );
    if (anyInvalidFormatSlug) {
      Log.error(
        `${errorFilename}の chapters には一次元配列のみを指定できます。ネストはできません`
      );
      return null;
    }
  }

  return bookMeta;
}

export function getLocalBookMetaList(sort?: ItemSortType): BookMeta[] {
  const slugs = getBookSlugs(sort);
  const books = slugs
    .map((slug) => getLocalBookMeta(slug))
    .filter((book): book is BookMeta => book !== null);
  return books;
}

export function getLocalChapter(
  book: BookMeta,
  chapterFilename: string
): null | Chapter {
  const data = readChapterFile(book, chapterFilename);
  if (!data) return null;

  const { meta, bodyMarkdown } = data;
  const rawHtml = markdownToHtml(bodyMarkdown, {
    embedOrigin: process.env.VITE_EMBED_SERVER_ORIGIN,
  });
  const bodyHtml = completeHtml(rawHtml);
  return {
    ...meta,
    bodyHtml,
  };
}

function getLocalChapterMeta(
  book: BookMeta,
  chapterFilename: string
): null | ChapterMeta {
  const data = readChapterFile(book, chapterFilename);
  return data ? data.meta : null;
}

export function getLocalChapterMetaList(book: BookMeta): ChapterMeta[] {
  const filenames = getChapterFilenames(book.slug);

  const chapters = filenames
    .map((chapterFilename) => getLocalChapterMeta(book, chapterFilename))
    .filter((chapter): chapter is ChapterMeta => chapter !== null)
    .sort((a, b) => {
      return (
        Number(a.position === null ? 999 : a.position) -
        Number(b.position === null ? 999 : b.position)
      );
    });
  return chapters;
}

function getBookSlugs(sort?: ItemSortType): string[] {
  const dirFullpath = getWorkingPath('books');
  const allDirs =
    sort === 'system'
      ? listDirnames(dirFullpath)
      : listDirnamesOrderByModified(dirFullpath);

  if (allDirs === null) return [];

  // `.`から始まるディレクトリは除外する
  return allDirs.filter((filename) => !/^\./.test(filename));
}

function readBookFile(slug: string) {
  const configRaw = getBookConfigRaw(slug);
  if (!configRaw) return null;

  try {
    const yamlData = yaml.load(configRaw) as any;
    if (typeof yamlData === 'string' || typeof yamlData === 'number') {
      throw 'Invalid yaml format.';
    }
    if (!yamlData) return null;
    return {
      slug,
      ...yamlData,
      specifiedChapterSlugs: (yamlData as any).chapters, // rename keyName `chapters` => `specifiedChapterSlugs` to avoid confusing.
      chapterOrderedByConfig: !!(yamlData as any).chapters?.length,
    } as BookMeta;
  } catch (e) {
    // couldn't load yaml files
    console.log(e);
    Log.error(`config.yamlの表記に誤りがあります（books/${slug}）`);
    return null;
  }
}

function getBookFullDirpath(slug: string) {
  return getWorkingPath(`books/${slug}`);
}

function getBookConfigRaw(slug: string) {
  const fullDirpath = getBookFullDirpath(slug);
  const fullpath = path.join(fullDirpath, 'config.yaml');
  const fallbackFullpath = path.join(fullDirpath, 'config.yml');

  const fileRaw = getFileRaw(fullpath) || getFileRaw(fallbackFullpath);
  if (!fileRaw) {
    Log.error(`${fullpath}の内容を取得できませんでした`);
  }
  return fileRaw;
}

function readCoverFile(imageFullpath: string) {
  try {
    const bufferImage = getImageRaw(imageFullpath);
    if (!bufferImage) return null;
    const coverFilesize = getImageSize(imageFullpath);
    const { width, height } = imageSizeOf(bufferImage);
    const mediaType = inferImageTypeFromUrl(imageFullpath);
    if (!mediaType) return null;

    const coverDataUrl = bufferToDataURL(bufferImage, mediaType);

    return {
      coverDataUrl,
      coverFilesize,
      coverWidth: width,
      coverHeight: height,
    };
  } catch (_e) {
    return null;
  }
}

function getChapterPositionAndSlug(
  book: BookMeta,
  filename: string
): {
  slug: string;
  position: null | number;
} {
  const filenameWithoutExt = filename.replace(/\.md$/, '');
  // get chapter number according to book.specifiedChapterSlugs (originally specified on config.yaml)
  if (book.specifiedChapterSlugs?.length) {
    const slug = filenameWithoutExt;
    const chapterIndex = book.specifiedChapterSlugs.findIndex(
      (s) => s === slug
    );
    return {
      slug,
      position: chapterIndex >= 0 ? chapterIndex : null,
    };
  }
  // get chapter number by filename
  const split = filenameWithoutExt.split('.');
  // filename must be `n.slug.md`
  if (split.length === 2) {
    const position = Number(split[0]);
    const slug = split[1];
    return {
      position,
      slug,
    };
  } else {
    // invalid filename
    return {
      position: null,
      slug: filenameWithoutExt,
    };
  }
}

function getChapterFilenames(bookSlug: string): string[] {
  const dirpath = getWorkingPath(`books/${bookSlug}`);
  const allFiles = listFilenames(dirpath);
  if (allFiles === null) {
    Log.error(`${dirpath}を取得できませんでした`);
    return [];
  }
  // filter markdown files
  return allFiles.filter((f) => /\.md$/.test(f)); // `.md`で終わるファイルのみに絞り込む
}

function readChapterFile(book: BookMeta, filename: string) {
  const { position, slug } = getChapterPositionAndSlug(book, filename);
  const raw = getChapterFileRaw(book.slug, filename);
  if (!raw) return null;
  const { data, content: bodyMarkdown } = matter(raw);
  return {
    meta: {
      ...data,
      position,
      slug,
      filename,
    } as ChapterMeta,
    bodyMarkdown,
  };
}

function getChapterFileRaw(bookSlug: string, chapterFilename: string) {
  const fullpath = getWorkingPath(`books/${bookSlug}/${chapterFilename}`);
  const fileRaw = getFileRaw(fullpath);
  if (!fileRaw) {
    Log.error(`${fullpath}の内容を取得できませんでした`);
  }
  return fileRaw;
}
