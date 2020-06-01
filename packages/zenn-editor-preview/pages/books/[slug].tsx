import Head from "next/head";
import { GetServerSideProps } from "next";

import BookHeader from "@components/BookHeader";
import MainContainer from "@components/MainContainer";
import ContentBody from "@components/ContentBody";
import { getAllContentsNavCollection } from "@utils/navCollections";
import { getBookBySlug } from "@utils/api/books";

import { Book, NavCollections } from "@types";

type BookSlugPageProps = {
  book: Book;
  allContentsNavCollection: NavCollections;
};

const BookSlugPage = ({
  book,
  allContentsNavCollection,
}: BookSlugPageProps) => {
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
              <h1>✍️ 本文を編集する</h1>
              <p>
                本文を編集するには、サイドバーからチャプターを選びます。新しくチャプターを作成する場合は
                <code>チャプター番号.md</code>
                という形式でファイルを作成します。チャプター1は
                <code>1.md</code>、チャプター2は
                <code>2.md</code>…のようになります。
                <br />
                <br />
                <a href="fixme" target="_blank">
                  本の作成について詳しく知る→
                </a>
              </p>
            </ContentBody>
          </div>
        </article>
      </MainContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BookSlugPageProps> = async ({
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
      res.end(`books/${slug}/config.yamlが取得できませんでした`);
      return;
    }
  }

  const allContentsNavCollection = getAllContentsNavCollection();

  return {
    props: {
      book: {
        ...book,
        slug,
      },
      allContentsNavCollection,
    },
  };
};

export default BookSlugPage;
