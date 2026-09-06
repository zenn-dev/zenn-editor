import { useMemo } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../ContentContainer';
import { ChapterHeader } from './show/ChapterHeader';
import { ChapterFooterNav } from './show/ChapterFooterNav';
import { BodyContentWithToc } from '../BodyContentWithToc';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useFetch } from '../../hooks/useFetch';
import { useTitle } from '../../hooks/useTitle';
import { Book, Chapter, ChapterMeta } from 'zenn-model';

type ChapterShowProps = {
  bookSlug: string;
  chapterFilename: string;
};

export const ChapterShow: React.FC<ChapterShowProps> = ({
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

  // 前後のチャプターを求めるために一覧を取得する
  const { data: chaptersData, mutate: mutateChapters } = useFetch<{
    chapters: ChapterMeta[];
  }>(`/api/books/${bookSlug}/chapters`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
  });

  const { prevChapter, nextChapter } = useMemo(() => {
    const chapters = chaptersData?.chapters;
    if (!chapters) return {};
    // 本ページと同様に、デプロイ対象のチャプターのみを前後の対象とする。
    // デプロイ対象外のチャプターを表示している場合は前後リンクを表示しない。
    const deployedChapters = chapters.filter(
      (chapter) => typeof chapter.position === 'number'
    );
    const index = deployedChapters.findIndex(
      (chapter) => chapter.filename === chapterFilename
    );
    if (index === -1) return {};
    return {
      prevChapter: deployedChapters[index - 1],
      nextChapter: deployedChapters[index + 1],
    };
  }, [chaptersData, chapterFilename]);

  useTitle(`${chapter?.title || chapterFilename}のプレビュー`);

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutateBook();
    mutateChapter();
    mutateChapters();
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
            <BodyContentWithToc bodyHtml={chapter.bodyHtml} toc={chapter.toc} />
            <ChapterFooterNav
              bookSlug={bookSlug}
              prev={prevChapter}
              next={nextChapter}
            />
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
