import Head from "next/head";
import { GetServerSideProps } from "next";

import BookHeader from "@components/BookHeader";
import MainContainer from "@components/MainContainer";
import ContentBody from "@components/ContentBody";
import ChapterList from "@components/ChapterList";
import { getAllContentsNavCollections } from "@utils/nav-collections";
import { getBookBySlug } from "@utils/api/books";
import { getChapters } from "@utils/api/chapters";

import { Book, Chapter, NavCollections } from "@types";

const BodyPlaceholder = () => (
  <>
    <h1>✍️ チャプターを作成する</h1>
    <p>
      1つめのチャプターを作成しましょう。チャプターは
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
  </>
);

type BookSlugPageProps = {
  book: Book;
  chapters: Chapter[];
  allContentsNavCollection: NavCollections;
};

const BookSlugPage = ({
  book,
  chapters,
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
              {chapters?.length ? (
                <>
                  <h1>✍️ チャプターを編集する</h1>
                  <ChapterList chapters={chapters} bookSlug={book.slug} />
                </>
              ) : (
                <BodyPlaceholder />
              )}
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

export default BookSlugPage;
