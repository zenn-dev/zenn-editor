import Head from "next/head";
import { NextPage, GetServerSideProps } from "next";

import { BookHeader } from "@components/BookHeader";
import { MainContainer } from "@components/MainContainer";
import { ContentBody } from "@components/ContentBody";
import { ChapterList } from "@components/ChapterList";
import { BookBodyPlaceholder } from "@components/BookBodyPlaceholder";

import { getAllContentsNavCollections } from "@utils/nav-collections";
import { getBookBySlug } from "@utils/api/books";
import { getChapters } from "@utils/api/chapters";

import { Book, Chapter, NavCollections } from "@types";

type Props = {
  book: Book;
  chapters: Chapter[];
  allContentsNavCollection: NavCollections;
};

const Page: NextPage<Props> = ({
  book,
  chapters,
  allContentsNavCollection,
}) => {
  return (
    <>
      <Head>
        <title>{book.title || "無題"}の編集</title>
      </Head>
      <MainContainer navCollections={allContentsNavCollection}>
        <article>
          <div>
            <BookHeader book={book} />
            <ContentBody>
              {chapters?.length ? (
                <>
                  <h1>✍️ チャプターを編集する</h1>
                  <ChapterList chapters={chapters} bookSlug={book.slug} />
                </>
              ) : (
                <BookBodyPlaceholder />
              )}
            </ContentBody>
          </div>
        </article>
      </MainContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  res,
  params,
}) => {
  const paramsSlug = params.slug;
  const slug: string = Array.isArray(paramsSlug) ? paramsSlug[0] : paramsSlug;
  const book = getBookBySlug(slug);

  if (!book) {
    if (res) {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.statusCode = 404;
      res.end(`books/${slug}/config.yamlの内容が取得できませんでした`);
      return;
    }
  }

  const chapters = getChapters(slug, ["title", "position"]);

  const allContentsNavCollection = getAllContentsNavCollections();

  return {
    props: {
      book: {
        ...book,
        slug,
      },
      chapters,
      allContentsNavCollection,
    },
  };
};

export default Page;
