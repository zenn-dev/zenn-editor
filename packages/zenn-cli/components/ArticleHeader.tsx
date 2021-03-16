import React from 'react';
import { Article } from '@types';
import { ContentWrapper } from '@components/ContentWrapper';
import { ErrorRow } from '@components/ErrorRow';
import { getArticleErrors } from '@utils/validator';

type Props = { article: Article };

export const ArticleHeader: React.FC<Props> = ({ article }) => {
  const errorMessages = getArticleErrors(article);
  const errorCount = errorMessages?.length;
  return (
    <header className="content-header">
      <ContentWrapper>
        <h1 className="content-header__title">{article.title || 'No Title'}</h1>

        <div className="content-header__row">
          <span className="content-header__row-title">slug</span>
          <span className="content-header__row-result">{article.slug}</span>
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">emoji</span>
          <span className="content-header__row-result">
            {article.emoji ? (
              <span style={{ fontSize: '20px' }}>{article.emoji}</span>
            ) : (
              '指定が必要です'
            )}
          </span>
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">topics</span>
          <span className="content-header__row-result">
            {Array.isArray(article.topics) && article.topics.length
              ? article.topics.map((t, i) => (
                  <span className="content-header__topic" key={`at${i}`}>
                    {t}
                  </span>
                ))
              : '指定が必要です'}
          </span>
        </div>

        {article.published !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">published</span>
            <span className="content-header__row-result">
              {article.published ? '✅（公開）' : 'false（下書き）'}
            </span>
          </div>
        )}

        <div className="content-header__row">
          <span className="content-header__row-title">type</span>
          <span className="content-header__row-result">
            {article.type || '指定が必要です'}
            {article.type === 'tech' ? '（技術記事）' : ''}
            {article.type === 'idea' ? '（アイデア）' : ''}
          </span>
        </div>

        {!!errorCount && (
          <div>
            <div className="content-header__error-title">
              {errorCount}件の修正が必要です
            </div>
            {errorMessages.map((errorMessage, index) => (
              <ErrorRow errorMessage={errorMessage} key={`invldmsg${index}`} />
            ))}
          </div>
        )}

        <a
          href="https://zenn.dev/zenn/articles/zenn-cli-guide"
          className="content-header__link"
          rel="noopener noreferrer"
          target="_blank"
        >
          記事の作成方法 →
        </a>
      </ContentWrapper>
    </header>
  );
};
