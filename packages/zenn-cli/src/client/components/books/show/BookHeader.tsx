import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Book } from '../../../../common/types';
import { getBookErrors } from '../../../lib/validator';
import { ContentContainer } from '../../ContentContainer';
import { TopicList } from '../../TopicList';
import { PropertyRow } from '../../PropertyRow';
import { ValidationErrors } from '../../ValidationErrors';

type Props = { book: Book };

export const BookHeader: React.VFC<Props> = ({ book }) => {
  const validationErrors = useMemo(() => getBookErrors(book), [book]);

  return (
    <StyledBookHeader>
      <ContentContainer>
        <div className="book-header__hero">
          <div className="book-header__cover">
            <img
              src={book.coverDataUrl || '/static-images/book-cover.png'}
              className="book-header__cover-img"
              alt="カバー画像のプレビュー"
              width="160"
              height="224"
            />
          </div>
          <h1 className="book-header__title">
            {book.title || 'titleを指定してください'}
          </h1>
        </div>

        <div className="book-header__properties">
          <PropertyRow title="slug">{book.slug}</PropertyRow>

          <PropertyRow title="published">
            {typeof book.published === 'boolean' ? (
              <>{book.published ? 'true（公開）' : 'false（下書き）'}</>
            ) : (
              'true もしくは false を指定してください'
            )}
          </PropertyRow>

          <PropertyRow title="price">
            {typeof book.price === 'number'
              ? book.price
              : '半角数字で指定してください'}
          </PropertyRow>

          <PropertyRow title="topics">
            {Array.isArray(book.topics) && book.topics.length ? (
              <TopicList topics={book.topics} />
            ) : (
              '指定が必要です'
            )}
          </PropertyRow>

          <PropertyRow title="summary">
            <div className="book-header__summary">
              {book.summary || '指定が必要です'}
            </div>
          </PropertyRow>
        </div>

        {!!validationErrors.length && (
          <div className="book-header__validation-errors">
            <ValidationErrors validationErrors={validationErrors} />
          </div>
        )}
      </ContentContainer>
    </StyledBookHeader>
  );
};

const StyledBookHeader = styled.header`
  padding: 3.3rem 0;
  background: var(--c-gray-bg);
  .book-header__hero {
    display: flex;
    align-items: center;
  }
  .book-header__cover-img {
    background: #fff;
    object-fit: cover;
    box-shadow: 0 9px 20px -9px rgba(0, 27, 68, 0.52),
      0 0 3px rgba(0, 21, 60, 0.1);
    border-radius: 5px;
  }
  .book-header__title {
    flex: 1;
    margin-top: -1em;
    margin-left: 1.2em;
    font-size: 1.8rem;
  }
  .book-header__properties {
    margin-top: 1.5rem;
  }
  .book-header__summary {
    white-space: pre-line;
  }
  .book-header__validation-errors {
    margin-top: 1.4rem;
  }
  @media (max-width: 768px) {
    .book-header__hero {
      display: block;
    }
    .book-header__cover {
      text-align: center;
    }
    .book-header__title {
      margin: 1.7rem 0 0;
      font-size: 1.5rem;
    }
  }
`;
