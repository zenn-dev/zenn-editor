import styled from 'styled-components';
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
import { EditableBodyContent } from '../EditableBodyContent';
import { useState } from 'react';
import { BodyContent } from '../BodyContent';
import { Switch } from '../Switch';
import markdownToHtml, { parseToc } from 'zenn-markdown-html';

type ArticleShowProps = {
  slug: string;
};

export const ArticleShow: React.FC<ArticleShowProps> = ({ slug }) => {
  const [isEditable, setIsEditable] = useState(false);

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

            <StyledEditMode>
              <StyledLabel>編集モード</StyledLabel>
              <Switch
                checked={isEditable}
                onChange={(checked) => setIsEditable(checked)}
              />
            </StyledEditMode>

            {isEditable ? (
              <EditableBodyContent
                markdown={article.markdown ?? ''}
                onChange={(markdown) => {
                  // 本番環境でのみWebSocket連携
                  if (import.meta.env.MODE === 'production') {
                    ws?.send(
                      JSON.stringify({
                        type: 'contentChanged',
                        article: { ...article, markdown },
                      })
                    );
                  }

                  const html = markdownToHtml(markdown);

                  mutate(
                    {
                      article: {
                        ...article,
                        markdown,
                        bodyHtml: html,
                        toc: parseToc(html),
                      },
                    },
                    false // API反映まで時間がかかるため、ブラウザのデータを真にする
                  );
                }}
              />
            ) : (
              <BodyContent rawHtml={article.bodyHtml ?? ''} />
            )}
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

const StyledEditMode = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin: 3rem 0;
`;

const StyledLabel = styled.label`
  cursor: pointer;
  border-bottom: 1px dashed var(--c-gray-border);
`;
