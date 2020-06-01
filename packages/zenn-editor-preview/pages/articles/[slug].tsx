import Head from "next/head";

import markdownToHtml from "zenn-markdown-html";
import ContentBody from "@components/ContentBody";
import ArticleHeader from "@components/ArticleHeader";
import MainContainer from "@components/MainContainer";
import { getAllContentsNavCollection } from "@utils/navCollections";
import { getArticleBySlug } from "@utils/api";

import { Article, NavCollections } from "@types";

type ArticleSlugPageProps = {
  article: Article;
  allContentsNavCollection: NavCollections;
};

const ArticleSlugPage = ({
  article,
  allContentsNavCollection,
}: ArticleSlugPageProps) => {
  return (
    <MainContainer navCollections={allContentsNavCollection}>
      <article>
        <div>
          <ArticleHeader article={article} />
          <ContentBody content={article.content} />
        </div>
      </article>
    </MainContainer>
  );
};

export const getServerSideProps = ({ params }) => {
  const slug = params.slug;
  const article = getArticleBySlug(slug);
  const content = markdownToHtml(article.content);
  const allContentsNavCollection = getAllContentsNavCollection();

  return {
    props: {
      article: {
        ...article,
        content,
        slug,
      },
      allContentsNavCollection,
    },
  };
};

export default ArticleSlugPage;
