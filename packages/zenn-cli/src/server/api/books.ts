import Express from 'express';

import {
  getLocalBook,
  getLocalBookMeta,
  getLocalBookMetaList,
  getLocalChapter,
  getLocalChapterMetaList,
} from '../lib/books';

import { getValidSortTypes } from '../../common/helper';

const bookNotFoundMessage =
  '本の設定ファイルの取得時にエラーが発生しました。ターミナルの出力をご確認ください';

export function getBook(req: Express.Request, res: Express.Response) {
  const slug = req.params.slug;
  const book = getLocalBook(slug);
  if (!book) {
    res.status(404).json({
      message: bookNotFoundMessage,
    });
    return;
  }
  res.json({ book });
}

export function getBooks(req: Express.Request, res: Express.Response) {
  const sort = getValidSortTypes(req.query.sort);
  const books = getLocalBookMetaList(sort);
  res.json({ books });
}

export function getChapter(req: Express.Request, res: Express.Response) {
  const bookSlug = req.params.book_slug;
  const book = getLocalBookMeta(bookSlug);
  if (!book) {
    res.status(404).json({
      message: bookNotFoundMessage,
    });
    return;
  }
  const chapterFilename = req.params.chapter_filename;
  const chapter = getLocalChapter(book, chapterFilename);
  if (!chapter) {
    res
      .status(404)
      .json({ message: 'チャプターのマークダウンを取得できませんでした' });
    return;
  }
  res.json({ chapter });
}

export function getChapters(req: Express.Request, res: Express.Response) {
  const bookSlug = req.params.book_slug;
  const book = getLocalBookMeta(bookSlug);
  if (!book) {
    res.status(404).json({
      message: bookNotFoundMessage,
    });
    return;
  }
  const chapters = getLocalChapterMetaList(book);
  res.json({ chapters });
}
