import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Article } from '../../../../common/types';
import { getArticleErrors } from '../../../lib/validator';
import { ContentContainer } from '../../ContentContainer';
import { TopicList } from '../../TopicList';
import { PropertyRow } from '../../PropertyRow';
import { publishedAtRegex } from '../../../lib/validator';
import { ValidationErrors } from '../../ValidationErrors';

type Props = { article: Article };

function completePublishedAt(
  published_at?: Date | string | null
): string | undefined {
  if (published_at == null) return undefined;
  if (published_at instanceof Date) return 'フォーマットを確認してください';
  if (isNaN(Date.parse(published_at))) return 'フォーマットを確認してください';
  if (!published_at.match(publishedAtRegex))
    return 'フォーマットを確認してください';

  return formatPublishedAt(new Date(Date.parse(published_at)));
}

function formatPublishedAt(published_at: Date): string {
  return new Intl.DateTimeFormat('ja-jp', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(published_at);
}

export const ArticleHeader: React.VFC<Props> = ({ article }) => {
  const validationErrors = useMemo(() => getArticleErrors(article), [article]);
  const published_at = completePublishedAt(article.published_at);
  const scheduled_publish = !!(
    published_at && Date.parse(published_at) > Date.now()
  );

  return (
    <StyledArticleHeader>
      <ContentContainer>
        {typeof article.emoji === 'string' && (
          <div className="article-header__emoji">{article.emoji}</div>
        )}

        <h1 className="article-header__title">
          {article.title || 'titleを指定してください'}
        </h1>
        <div className="article-header__properties">
          <PropertyRow title="slug">{article.slug}</PropertyRow>

          <PropertyRow title="published">
            {typeof article.published === 'boolean' ? (
              <>
                {article.published
                  ? scheduled_publish
                    ? 'true（公開予約）'
                    : 'true（公開）'
                  : 'false（下書き）'}
              </>
            ) : (
              'true もしくは false を指定してください'
            )}
          </PropertyRow>

          {published_at && (
            <PropertyRow title="published_at">{published_at}</PropertyRow>
          )}

          <PropertyRow title="type">
            {article.type === 'tech' ? (
              'tech（技術記事）'
            ) : (
              <>
                {article.type === 'idea'
                  ? 'idea（アイデア）'
                  : 'tech もしくは idea を指定してください'}
              </>
            )}
          </PropertyRow>

          <PropertyRow title="topics">
            {Array.isArray(article.topics) && article.topics.length ? (
              <TopicList topics={article.topics} />
            ) : (
              '指定が必要です'
            )}
          </PropertyRow>
        </div>
        {!!validationErrors.length && (
          <div className="article-header__validation-errors">
            <ValidationErrors validationErrors={validationErrors} />
          </div>
        )}
      </ContentContainer>
    </StyledArticleHeader>
  );
};

const StyledArticleHeader = styled.header`
  padding: 3.3rem 0;
  background: var(--c-gray-bg);
  .article-header__emoji {
    margin-top: -0.5em;
    font-size: 56px;
    color: #000;
  }
  .article-header__title {
    font-size: 1.9rem;
  }
  .article-header__properties {
    margin-top: 1rem;
  }
  .article-header__validation-errors {
    margin-top: 1.4rem;
  }
`;
