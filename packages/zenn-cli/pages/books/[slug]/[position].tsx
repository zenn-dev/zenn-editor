import Head from "next/head";
import { NextPage, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import markdownToHtml from "zenn-markdown-html";
import initEmbed from "zenn-init-embed";
import { ContentBody } from "@components/ContentBody";
import { ChapterHeader } from "@components/ChapterHeader";
import { MainContainer } from "@components/MainContainer";
import { getBookNavCollections } from "@utils/nav-collections";
import { getChapter } from "@utils/api/chapters";

import { Chapter, NavCollections } from "@types";

type Props = {
  chapter: Chapter;
  bookNavCollections: NavCollections;
};

const Page: NextPage<Props> = (props) => {
  const { chapter } = props;
  const router = useRouter();

  useEffect(() => {
    initEmbed(); // reInit everytime page changes
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{chapter.title || `${chapter.position}.md`}のプレビュー</title>
      </Head>
      <MainContainer navCollections={props.bookNavCollections}>
        <article>
          <ChapterHeader chapter={chapter} />
          <ContentBody content={chapter.content} />
        </article>
      </MainContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  res,
  params,
}) => {
  const slug = params.slug as string;
  const position = params.position as string;

  const bookNavCollections = getBookNavCollections(slug);

  const chapter = getChapter(slug, position, null);

  if (!chapter) {
    if (res) {
      res.writeHead(301, { Location: `/books/${slug}` });
      res.end();
      return;
    }
  }

  const content = markdownToHtml(chapter.content);

  return {
    props: {
      chapter: {
        ...chapter,
        content,
      },
      bookNavCollections,
    },
  };
};

export default Page;
