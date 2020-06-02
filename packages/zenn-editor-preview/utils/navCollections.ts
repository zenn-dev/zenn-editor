import { getAllArticles } from "@utils/api/articles";
import { getAllBooks, getBookBySlug } from "@utils/api/books";
import { Article, Book, Chapter, NavCollection, NavCollections } from "@types";
import { getChapters } from "./api/chapters";

const articlePlaceholderItem = {
  name: "✨最初の記事を作成しましょう",
  realPath: `/todo`,
  dynamicRoutePath: null,
};

export const getAllArticlesNavCollection = (): NavCollection => {
  const allArticles = getAllArticles(["title", "emoji"]);
  const items = allArticles?.map((article: Article) => {
    return {
      name: `${article.emoji || "📄"}${article.title || article.slug}`,
      realPath: `/articles/${article.slug}`,
      dynamicRoutePath: `/articles/[slug]`,
    };
  });
  return {
    name: "articles",
    items: items?.length ? items : [articlePlaceholderItem],
  };
};

const bookPlaceholderItem = {
  name: "✨最初の本を作成しましょう",
  realPath: `/todo`,
  dynamicRoutePath: null,
};

export const getAllBooksNavCollection = (): NavCollection => {
  const allBooks = getAllBooks(["title"]);
  const items = allBooks?.map((book: Book) => {
    return {
      name: `📙${book.title || "無題のタイトル"}`,
      realPath: `/books/${book.slug}`,
      dynamicRoutePath: `/books/[slug]`,
    };
  });

  return {
    name: "books",
    items: items?.length ? items : [bookPlaceholderItem],
  };
};

export const getAllContentsNavCollections = (): NavCollections => [
  getAllArticlesNavCollection(),
  getAllBooksNavCollection(),
];

export const getBookNavCollections = (slug: string): NavCollections => {
  // slug = Book slug
  const book = getBookBySlug(slug);
  if (!book) throw new Error(`books/${slug}の情報を取得できませんでした`);
  const chapters = getChapters(slug, ["title"]);
  const items = chapters?.map((chapter: Chapter) => {
    return {
      name: `📄${chapter.title || "無題のチャプター"}`,
      realPath: `/books/${slug}/${chapter.position}`,
      dynamicRoutePath: `/books/[slug]/[position]`,
    };
  });

  items.unshift({
    name: "← 戻る",
    realPath: `/books/${slug}`,
    dynamicRoutePath: `/books/[slug]`,
  });

  const bookNavCollection: NavCollection = {
    name: `📙 ${book?.title || slug}`,
    items,
  };

  return [bookNavCollection];
};
