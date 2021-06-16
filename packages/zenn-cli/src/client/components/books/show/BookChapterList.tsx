import React from 'react';
import { ChapterMeta } from '../../../../common/types';
import { LinkChapter } from '../../Routes';
import styled from 'styled-components';

type Props = {
  bookSlug: string;
  chapters: ChapterMeta[];
  showListNumber: boolean;
};

export const BookChapterList: React.VFC<Props> = ({
  bookSlug,
  chapters,
  showListNumber,
}) => {
  const ListContainerTag = showListNumber ? `ol` : `ul`;

  return (
    <StyledBookChapterList className={`book-chapter-list`}>
      <ListContainerTag>
        {chapters.map((chapter) => (
          <li
            key={`book-chapter-${chapter.filename}`}
            className="book-chapter-list__li"
          >
            <LinkChapter
              bookSlug={bookSlug}
              chapterFilename={chapter.filename}
              className="book-chapter-list__link"
            >
              {chapter.title || '無題'}
              <span className="book-chapter-list__slug">
                （{chapter.slug || chapter.filename}）
              </span>
            </LinkChapter>
          </li>
        ))}
      </ListContainerTag>
    </StyledBookChapterList>
  );
};

const StyledBookChapterList = styled.div`
  color: var(--c-gray);
  font-weight: 700;
  ul,
  ol {
    margin-left: 1.4em;
    padding-left: 0.2em;
  }
  ul {
    list-style: disc;
  }
  ol {
    list-style: decimal;
  }
  .book-chapter-list__li {
    margin: 0.3rem 0;
  }
  .book-chapter-list__link {
    color: var(--c-primary-darker);
    font-weight: normal;
    &:hover {
      text-decoration: underline;
    }
  }
  .book-chapter-list__slug {
    font-size: 0.8em;
    opacity: 0.7;
    text-decoration: none;
  }
`;
