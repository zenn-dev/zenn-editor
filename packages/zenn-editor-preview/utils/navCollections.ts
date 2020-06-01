import { getAllArticles } from "@utils/api";
import { Article, NavCollection, NavCollections, NavItem } from "@types";

export const getAllArticlesNavCollection = (): NavCollection => {
  const allArticles = getAllArticles(["title", "slug"]);

  return {
    name: "articles",
    items: allArticles.map((article: Article) => {
      return {
        name: `📄${article.title || article.slug}`,
        realPath: `/articles/${article.slug}`,
        dynamicRoutePath: `/articles/[slug]`,
      };
    }),
  };
};

const bookPlaceholderItem = {
  name: "📙最初の本を作りましょう",
  realPath: `/todo`,
  dynamicRoutePath: null,
};

export const getAllBooksNavCollection = (): NavCollection => {
  const allBooks = []; // todo
  let items = allBooks.map((article: Article) => {
    return {
      name: article.title || "無題のタイトル",
      realPath: `/articles/${article.slug}`,
      dynamicRoutePath: `/articles/[slug]`,
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
