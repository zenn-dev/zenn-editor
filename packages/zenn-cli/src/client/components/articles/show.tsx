import styled from 'styled-components';
import { ContentContainer } from '../ContentContainer';
import { ArticleHeader } from './show/ArticleHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useTitle } from '../../hooks/useTitle';
import { Article } from 'zenn-model';
import { BodyContentWithToc } from '../BodyContentWithToc';

type ArticleShowProps = {
  slug: string;
};

export const ArticleShow: React.FC<ArticleShowProps> = ({ slug }) => {
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

  if (!article) {
    if (isValidating) return <Loading margin="5rem auto" />;
    return <ErrorMessage message={error?.message} />;
  }

  return (
    <>
      <ArticleHeader article={article} />
      <ContentContainer>
        <StyledArticleShow className="article-show">
          <div className="article-show__content">
            <BodyContentWithToc bodyHtml={article.bodyHtml} toc={article.toc} />
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
