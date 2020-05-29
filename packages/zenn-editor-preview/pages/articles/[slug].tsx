import { getArticleBySlug } from "../../lib/api";
import markdownToHtml from "zenn-markdown-html";
import Head from "next/head";

// todo: type
export default function Post({ article }: any) {
  return (
    <article>
      <div>
        <h1>{article.slug}</h1>
        <div
          className="md-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
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
