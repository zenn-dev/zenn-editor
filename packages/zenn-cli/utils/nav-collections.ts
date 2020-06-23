import { getAllArticles } from "@utils/api/articles";
import { getAllBooks, getBookBySlug } from "@utils/api/books";
import {
  Article,
  Book,
  Chapter,
  NavCollection,
  NavCollections,
  NavItem,
} from "@types";
import { getChapters } from "./api/chapters";
import { throwWithConsoleError } from "@utils/errors";

const draftLabel = `<span class="draft">下書き</span>`;

const articlePlaceholderItem = {
  name: "✨ 最初の記事を作成しましょう",
  realPath: `/todo`,
  dynamicRoutePath: null,
};

export const getAllArticlesNavCollection = (): NavCollection => {
  const allArticles = getAllArticles(["title", "emoji", "published"]);
  const items: NavItem[] = allArticles?.map((article: Article) => {
    // article will be public unless "published" field is specified.
    const name = `${article.emoji || "📄"} ${
      article.published === false ? draftLabel : ""
    }${article.title || article.slug}`;
    return {
      name,
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
  name: "✨ 最初の本を作成しましょう",
  realPath: `/todo`,
  dynamicRoutePath: null,
};

export const getAllBooksNavCollection = (): NavCollection => {
  const allBooks = getAllBooks(["title", "published"]);
  const items: NavItem[] = allBooks?.map((book: Book) => {
    // book will be draft unless "published" field is specified.

    const name = `📙 ${book.published ? "" : draftLabel}${
      book.title || "無題のタイトル"
    }`;
    return {
      name,
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
  if (!book) throwWithConsoleError(`books/${slug}の情報を取得できませんでした`);

  const chapters = getChapters(slug, ["title"]);
  const items: NavItem[] = chapters?.map((chapter: Chapter) => {
    return {
      name: `📄${chapter.title || chapter.position + ".md"}`,
      realPath: `/books/${slug}/${chapter.position}`,
      dynamicRoutePath: `/books/[slug]/[position]`,
    };
  });

  const navItemBack: NavItem = {
    name: "← 戻る",
    realPath: `/books/${slug}`,
    dynamicRoutePath: `/books/[slug]`,
  };
  items.unshift(navItemBack);
  const bookNavCollection: NavCollection = {
    name: `📙 ${book?.title || slug}`,
    items,
  };
  return [bookNavCollection];
};
