import React from 'react';
import Link from 'next/link';
import { Chapter } from '@types';

type Props = { bookSlug: string; chapters: Chapter[]; unordered?: boolean };

export const ChapterList: React.FC<Props> = ({
  chapters,
  bookSlug,
  unordered,
}) => {
  const ListContainerTag = unordered ? 'ul' : 'ol';
  return (
    <div>
      <ListContainerTag>
        {chapters.map((chapter) => {
          return (
            <li key={`ch${chapter.slug}`} className="chapter-list-item">
              <Link
                href="/books/[book_slug]/[chapter_slug]"
                as={`/books/${bookSlug}/${chapter.slug}`}
                passHref
              >
                <a className="chapter-list-link">
                  <span className="chapter-list-title">
                    {chapter.title || `タイトルなし`}
                  </span>
                  <span className="chapter-list-filename">
                    （{chapter.slug}.md）
                  </span>
                </a>
              </Link>
            </li>
          );
        })}
      </ListContainerTag>
    </div>
  );
};
