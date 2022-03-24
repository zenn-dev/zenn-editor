import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BodyContent } from '../BodyContent';
import { ContentContainer } from '../ContentContainer';
import { ArticleHeader } from './show/ArticleHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useTitle } from '../../hooks/useTitle';
import { Article } from '../../../common/types';

type ArticleShowProps = {
  slug: string;
};

export const ArticleShow: React.VFC<ArticleShowProps> = ({ slug }) => {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const { data, error, isValidating, mutate } = useFetch<{ article: Article }>(
    `/api/articles/${slug}`,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
    }
  );
  const article = data?.article;

  useTitle(`${article?.title || slug}のプレビュー`);

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutate();
  });

  // 印刷時にdetailsを開くためのHooks
  useEffect(() => {
    const ref = bodyRef.current;

    if (!ref) return;
    if (!article?.bodyHtml?.length) return;

    const details = Array.from(ref.getElementsByTagName('details'));

    const changeDetailStatusFactory = (open: boolean) => () => {
      details.forEach((detail) => {
        detail.open = open;
      });
    };

    const onBeforePrint = changeDetailStatusFactory(true);
    const onAfterPrint = changeDetailStatusFactory(false);

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [article?.bodyHtml]);

  if (!article) {
    if (isValidating) return <Loading margin="5rem auto" />;
    return <ErrorMessage message={error?.message} />;
  }

  return (
    <>
      <ArticleHeader article={article} />
      <ContentContainer>
        <StyledArticleShow className="article-show">
          <div ref={bodyRef} className="article-show__content">
            <BodyContent rawHtml={article.bodyHtml || ''} />
          </div>
        </StyledArticleShow>
      </ContentContainer>
    </>
  );
};

const StyledArticleShow = styled.div`
  .article-show__content {
    padding: 3rem 0 18rem;
  }
`;
