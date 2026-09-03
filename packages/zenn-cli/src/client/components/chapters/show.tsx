import { useMemo } from 'react';
import styled from 'styled-components';
import { ContentContainer } from '../ContentContainer';
import { ChapterHeader } from './show/ChapterHeader';
import { ChapterFooterNav } from './show/ChapterFooterNav';
import { Toc } from '../Toc';
import { InsertAnchorButtonToHeadings } from '../InsertAnchorButtonToHeadings';
import { ErrorMessage } from '../ErrorMessage';
import { BodyContent } from '../BodyContent';
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
    const index = chapters.findIndex((c) => c.filename === chapterFilename);
    if (index === -1) return {};
    return {
      prevChapter: chapters[index - 1],
      nextChapter: chapters[index + 1],
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
            {chapter.toc && chapter.toc.length > 0 && (
              <Toc maxDepth={2} toc={chapter.toc} />
            )}
            <InsertAnchorButtonToHeadings>
              <BodyContent rawHtml={chapter.bodyHtml || ''} />
            </InsertAnchorButtonToHeadings>
          </div>
          <ChapterFooterNav
            bookSlug={bookSlug}
            prev={prevChapter}
            next={nextChapter}
          />
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
