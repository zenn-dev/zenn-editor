import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getArticleBySlug } from "../../lib/api";
import Head from "next/head";

// todo: type
export default function Post({ article }: any) {
  const router = useRouter();
  if (!router.isFallback && !article?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <article>
      {router.isFallback ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h1>{article.slug}</h1>
          <div>{article.content}</div>
        </div>
      )}
    </article>
  );
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const article = getArticleBySlug(slug, ["content"]);

  return {
    props: {
      article: {
        slug,
        ...article,
      },
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
