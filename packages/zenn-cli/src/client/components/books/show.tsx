import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../ContentContainer';
import { BookHeader } from './show/BookHeader';
import { BookChapterList } from './show/BookChapterList';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useTitle } from '../../hooks/useTitle';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { Book, ChapterMeta } from '../../../common/types';
import { MdOutlineCallMade } from 'react-icons/md';

type BookShowProps = {
  slug: string;
};

export const BookShow: React.VFC<BookShowProps> = ({ slug }) => {
  const {
    data: bookData,
    error: bookError,
    isValidating: isValidatingBook,
    mutate: mutateBook,
  } = useFetch<{ book: Book }>(`/api/books/${slug}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });
  const book = bookData?.book;

  useTitle(`${book?.title || slug}のプレビュー`);

  const {
    data: chaptersData,
    error: chaptersError,
    isValidating: isValidatingChapters,
    mutate: mutateChapters,
  } = useFetch<{ chapters: ChapterMeta[] }>(`/api/books/${slug}/chapters`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutateBook();
    mutateChapters();
  });

  const chapters = chaptersData?.chapters;

  // split chapters with/without position
  const { withPositionChapters, withoutPositionChapters } = useMemo(() => {
    if (!chapters)
      return {
        withPositionChapters: [],
        withoutPositionChapters: [],
      };
    return chapters.reduce(
      (acc, val) => {
        acc[
          typeof val.position === 'number'
            ? 'withPositionChapters'
            : 'withoutPositionChapters'
        ].push(val);
        return acc;
      },
      {
        withPositionChapters: [],
        withoutPositionChapters: [],
      } as {
        withPositionChapters: ChapterMeta[];
        withoutPositionChapters: ChapterMeta[];
      }
    );
  }, [chapters]);

  if (!book) {
    if (isValidatingBook) return <Loading margin="5rem auto" />;
    return <ErrorMessage message={bookError?.message} />;
  }

  return (
    <>
      <BookHeader book={book} />
      <ContentContainer>
        <StyledBookShow className="book-show">
          <h2 className="book-show__chapters-title">Chapters</h2>
          {isValidatingChapters ? (
            <Loading />
          ) : (
            <>
              {chaptersError ? (
                <ErrorMessage message={chaptersError?.message} />
              ) : (
                <div>
                  {!!withPositionChapters?.length && (
                    <div className="book-show__chapters">
                      <BookChapterList
                        bookSlug={book.slug}
                        chapters={withPositionChapters}
                        showListNumber={true}
                      />
                    </div>
                  )}
                  {!!withoutPositionChapters?.length && (
                    <div className="book-show__excluded-chapters">
                      <p className="book-show__chapters-note">
                        以下のチャプターはzenn.devへのデプロイ対象に含まれません。本に含めるチャプターの
                        <a
                          href="https://zenn.dev/zenn/articles/what-is-slug"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          スラッグ
                        </a>
                        を<code>config.yaml</code>
                        に指定するか、全てのチャプターのファイル名を
                        <code>チャプター番号.スラッグ.md</code>
                        の形式にしてください。
                        <a
                          href="https://zenn.dev/zenn/articles/zenn-cli-guide#%F0%9F%93%84-%E5%90%84%E3%83%81%E3%83%A3%E3%83%97%E3%82%BF%E3%83%BC%E3%81%AE%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%EF%BC%88%E2%97%AF%E2%97%AF.md%EF%BC%89"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          詳しい説明を開く
                          <MdOutlineCallMade className="book-show__open-icon" />
                        </a>
                      </p>

                      <div className="book-show__chapters">
                        <BookChapterList
                          bookSlug={book.slug}
                          chapters={withoutPositionChapters}
                          showListNumber={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </StyledBookShow>
      </ContentContainer>
    </>
  );
};

const StyledBookShow = styled.div`
  padding: 3rem 0 6rem;

  .book-show__chapters-title {
    font-size: 2rem;
  }
  .book-show__chapters {
    margin-top: 1rem;
    line-height: 1.5;
  }
  .book-show__excluded-chapters {
    margin-top: 2.5rem;
    padding: 1.3rem;
    border: solid 1px var(--c-gray-border);
    border-radius: 10px;
    color: var(--c-gray);
    font-size: 0.95rem;
  }
  .book-show__chapters-note {
    line-height: 1.8;
    code {
      line-height: 1.2;
      display: inline-flex;
      margin: 0 0.2em;
      padding: 0.2em 0.5em;
      font-size: 0.88em;
      background: var(--c-gray-bg);
      border-radius: 5px;
    }
    a {
      display: inline-flex;
      align-items: center;
      text-decoration: underline;
      text-underline-offset: 4px;
      text-decoration-color: var(--c-gray-border);
      &:hover {
        color: var(--c-body);
      }
    }
  }
  .book-show__open-icon {
    width: 15px;
    height: 15px;
  }
`;
