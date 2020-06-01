import { getAllArticles, getAllBooks } from "@utils/api";
import { Article, Book, NavCollection, NavCollections } from "@types";

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

export const getAllContentsNavCollection = (): NavCollections => [
  getAllArticlesNavCollection(),
  getAllBooksNavCollection(),
];
