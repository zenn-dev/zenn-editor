import styled from 'styled-components';
import { EditableBodyContent } from '../EditableBodyContent';
import { ContentContainer } from '../ContentContainer';
import { ArticleHeader } from './show/ArticleHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import {
  useLocalFileChangedEffect,
  useWebSocket,
} from '../../hooks/useLocalFileChangedEffect';
import { useTitle } from '../../hooks/useTitle';
import { Article } from 'zenn-model';
import { Toc } from '../Toc';
import { renderMarkdown } from 'zenn-wysiwyg-editor';

type ArticleShowProps = {
  slug: string;
};

export const ArticleShow: React.FC<ArticleShowProps> = ({ slug }) => {
  const ws = useWebSocket();
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
            {article.toc && article.toc.length > 0 && (
              <Toc maxDepth={2} toc={article.toc} />
            )}

            <EditableBodyContent
              key={article.markdown}
              markdown={article.markdown || ''}
              onChange={(markdown) => {
                ws?.send(
                  JSON.stringify({
                    type: 'contentChanged',
                    article: { ...article, markdown },
                  })
                );
              }}
            />
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
