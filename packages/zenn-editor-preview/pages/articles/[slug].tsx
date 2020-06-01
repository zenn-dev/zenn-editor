import Head from "next/head";
import { GetServerSideProps } from "next";

import markdownToHtml from "zenn-markdown-html";
import ContentBody from "@components/ContentBody";
import ArticleHeader from "@components/ArticleHeader";
import MainContainer from "@components/MainContainer";
import { getAllContentsNavCollection } from "@utils/navCollections";
import { getArticleBySlug } from "@utils/api/articles";

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
    <>
      <Head>
        <title>{article.title || "無題"}の編集</title>
      </Head>
      <MainContainer navCollections={allContentsNavCollection}>
        <article>
          <div>
            <ArticleHeader article={article} />
            <ContentBody content={article.content} />
          </div>
        </article>
      </MainContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ArticleSlugPageProps> = async ({
  res,
  params,
}) => {
  const paramsSlug = params.slug;
  const slug: string = Array.isArray(paramsSlug) ? paramsSlug[0] : paramsSlug;
  const article = getArticleBySlug(slug);

  if (!article) {
    if (res) {
      res.writeHead(301, { Location: "/" });
      res.end();
      return;
    }
  }

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
