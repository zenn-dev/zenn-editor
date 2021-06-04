import { useMemo } from 'react';
import Head from 'next/head';
import { NextPage, GetServerSideProps } from 'next';
import escapeHtml from 'escape-html';

import { BookHeader } from '@components/BookHeader';
import { MainContainer } from '@components/MainContainer';
import { ContentBody } from '@components/ContentBody';
import { ChapterList } from '@components/ChapterList';

import { getAllContentsNavCollections } from '@utils/nav-collections';
import { getBookBySlug } from '@utils/api/books';
import { getChapterMetas } from '@utils/api/chapters';

import { Book, ChapterMeta, NavCollections } from '@types';

type Props = {
  book: Book;
  chapters: ChapterMeta[];
  chapterFilenameListOnConfig: string[];
  allContentsNavCollection: NavCollections;
};

const Page: NextPage<Props> = (props) => {
  const { chapters, book } = props;
  const isAnyChapter = !!chapters?.length;

  const positionSpecifiedChapters = useMemo(
    () => chapters.filter((chapter) => chapter.position !== null),
    [chapters]
  );
  const positionUnspecifiedChapters = useMemo(
    () => chapters.filter((chapter) => chapter.position === null),
    [chapters]
  );
  const isConfigPositionMode = !!book.chapters;

  return (
    <>
      <Head>
        <title>{book.title || '無題'}のプレビュー</title>
      </Head>
      <MainContainer navCollections={props.allContentsNavCollection}>
        <article>
          <div>
            <BookHeader book={book} />
            <ContentBody>
              {isAnyChapter ? (
                <>
                  <h1>チャプターを編集する</h1>
                  <ChapterList
                    chapters={positionSpecifiedChapters}
                    bookSlug={book.slug}
                  />
                  {!!positionUnspecifiedChapters?.length && (
                    <>
                      <h4>
                        {isConfigPositionMode ? (
                          <h4>
                            以下のチャプターはconfig.yamlに指定されていないため公開されません
                          </h4>
                        ) : (
                          <h4>
                            以下のチャプターはファイル名が正しくないため公開されません
                          </h4>
                        )}
                      </h4>
                      <ChapterList
                        chapters={positionUnspecifiedChapters}
                        bookSlug={book.slug}
                        unordered={true}
                      />
                    </>
                  )}
                </>
              ) : (
                <div>
                  <div className="msg">
                    チャプターが見つかりません。
                    <code>config.yaml</code>で<code>chapters</code>
                    を指定するか、 各チャプターのファイル名を
                    <code>チャプター番号.スラッグ.md</code>としてください。
                  </div>
                  <a
                    href="https://zenn.dev/zenn/articles/zenn-cli-guide#cliで本（book）を管理する"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    本の作成について詳しく知る→
                  </a>
                </div>
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
  const slug = params.book_slug as string;
  const book = getBookBySlug(slug);

  if (!book) {
    if (res) {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.statusCode = 404;
      res.end(
        `本の設定ファイル（books/${escapeHtml(
          slug
        )}/config.yaml）の内容が取得できませんでした`
      );
      return {
        props: {} as any,
      };
    }
  }

  const chapterMetas = getChapterMetas(slug, book.chapters);

  const allContentsNavCollection = getAllContentsNavCollections();

  return {
    props: {
      book: {
        ...book,
        slug, // FIXME: book.slugを使えばいい?
      },
      chapters: chapterMetas,
      allContentsNavCollection,
    },
  };
};

export default Page;
