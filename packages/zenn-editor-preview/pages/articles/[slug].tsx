import Head from "next/head";

import { getArticleBySlug } from "../../lib/api";
import markdownToHtml from "zenn-markdown-html";
import ContentBody from "../../components/ContentBody";

// todo: type
export default function Post({ article }: any) {
  return (
    <article>
      <div>
        <h1>{article.slug}</h1>
        <ContentBody content={article.content} />
      </div>
    </article>
  );
}

export function getServerSideProps({ params }) {
  const slug = params.slug;
  const article = getArticleBySlug(slug, ["content"]);
  const content = markdownToHtml(article.content);

  return {
    props: {
      article: {
        ...article,
        content,
        slug,
      },
    },
  };
}
