import { useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import markdownToHtml from "zenn-markdown-html";
import initEmbed from "zenn-init-embed";
import ContentBody from "@components/ContentBody";
import ArticleHeader from "@components/ArticleHeader";
import MainContainer from "@components/MainContainer";
import { getAllContentsNavCollections } from "@utils/nav-collections";
import { getArticleBySlug } from "@utils/api/articles";
import { Article, NavCollections } from "@types";

type ArticleSlugPageProps = {
  article: Article;
  allContentsNavCollections: NavCollections;
};

const ArticleSlugPage = ({
  article,
  allContentsNavCollections,
}: ArticleSlugPageProps) => {
  const router = useRouter();

  useEffect(() => {
    initEmbed(); // reInit everytime page changes
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{article.title || "無題"}の編集</title>
      </Head>
      <MainContainer navCollections={allContentsNavCollections}>
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
  const allContentsNavCollections = getAllContentsNavCollections();

  return {
    props: {
      article: {
        ...article,
        content,
        slug,
      },
      allContentsNavCollections,
    },
  };
};

export default ArticleSlugPage;
