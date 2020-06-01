import Head from "next/head";
import { GetServerSideProps } from "next";

import BookHeader from "@components/BookHeader";
import MainContainer from "@components/MainContainer";
import { getAllContentsNavCollection } from "@utils/navCollections";
import { getBookBySlug } from "@utils/api";

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
      res.end(`books/${slug}/config.yamlが見つかりませんでした`);
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
