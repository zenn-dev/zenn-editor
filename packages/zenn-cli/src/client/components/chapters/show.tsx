import React from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../ContentContainer';
import { ChapterHeader } from './show/ChapterHeader';
import { ErrorMessage } from '../ErrorMessage';
import { BodyContent } from '../BodyContent';
import { Loading } from '../Loading';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useFetch } from '../../hooks/useFetch';
import { useTitle } from '../../hooks/useTitle';
import { Book, Chapter } from '../../../common/types';

type ChapterShowProps = {
  bookSlug: string;
  chapterFilename: string;
};

export const ChapterShow: React.VFC<ChapterShowProps> = ({
  bookSlug,
  chapterFilename,
}) => {
  const {
    data: bookData,
    error: bookError,
    isValidating: isValidatingBook,
    mutate: mutateBook,
  } = useFetch<{ book: Book }>(`/api/books/${bookSlug}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });
  const book = bookData?.book;

  const {
    data: chapterData,
    error: chapterError,
    isValidating: isValidatingChapter,
    mutate: mutateChapter,
  } = useFetch<{ chapter: Chapter }>(
    `/api/books/${bookSlug}/chapters/${chapterFilename}`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
    }
  );

  const chapter = chapterData?.chapter;

  useTitle(`${chapter?.title || chapterFilename}のプレビュー`);

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutateBook();
    mutateChapter();
  });

  if (!book) {
    if (isValidatingBook) return <Loading margin="5rem auto" />;
    return (
      <ErrorMessage
        message={
          bookError?.message || `本 ${bookSlug} のデータを取得できませんでした`
        }
      />
    );
  }

  if (!chapter) {
    if (isValidatingChapter) return <Loading margin="5rem auto" />;
    return (
      <ErrorMessage
        message={
          chapterError?.message ||
          `チャプター ${chapterFilename} のデータを取得できませんでした`
        }
      />
    );
  }

  return (
    <>
      <ChapterHeader book={book} chapter={chapter} />
      <ContentContainer>
        <StyledChapterShow className="book-show">
          <div className="chapter-show__content">
            <BodyContent rawHtml={chapter.bodyHtml || ''} />
          </div>
        </StyledChapterShow>
      </ContentContainer>
    </>
  );
};

const StyledChapterShow = styled.div`
  .chapter-show__content {
    padding: 3rem 0 10rem;
  }
`;
