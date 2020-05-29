import Head from "next/head";
import Link from "next/link";

import { getAllArticles } from "@utils/api";

export default function Index({ allArticles }) {
  return (
    <div>
      <Head>
        <title>Contents Index</title>
      </Head>

      {allArticles.map((article) => {
        const slug = article.slug;
        const realPath = `/articles/${slug}`;
        return (
          <div>
            <Link href="/articles/[slug]" as={realPath} key={slug}>
              <a href={realPath}>{slug}</a>
            </Link>
            {article.slug} - {article.content}
          </div>
        );
      })}
    </div>
  );
}

export function getStaticProps() {
  const allArticles = getAllArticles(["content", "slug"]);

  return {
    props: { allArticles },
  };
}
