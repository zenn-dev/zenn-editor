import styled from 'styled-components';
import { Toc } from '../../Toc';
import { EditableBodyContent } from '../../EditableBodyContent';
import { BodyContent } from '../../BodyContent';
import { Switch } from '../../Switch';
import { Article } from 'zenn-model';
import { useCallback } from 'react';
import markdownToHtml, { parseToc } from 'zenn-markdown-html';
import { useWebSocket } from '../../../hooks/useLocalFileChangedEffect';
import { ContentContainer } from '../../ContentContainer';

interface ArticleContentProps {
  article: Article;
  isEditable: boolean;
  handleContentChange: (article: Article) => void;
  handleEditableSwitchChange: (checked: boolean) => void;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  article,
  isEditable,
  handleContentChange,
  handleEditableSwitchChange,
}) => {
  const ws = useWebSocket();

  const innerContentChange = useCallback(
    (markdown: string) => {
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

      // HTMLはサーバーで出力されるCompleteHTMLで保存したいため、tocのみ更新する
      handleContentChange({
        ...article,
        toc: parseToc(html),
      });
    },
    [article]
  );

  return (
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
              onChange={handleEditableSwitchChange}
            />
          </StyledEditMode>

          {isEditable ? (
            <EditableBodyContent
              markdown={article.markdown ?? ''}
              onChange={innerContentChange}
            />
          ) : (
            <BodyContent rawHtml={article.bodyHtml ?? ''} />
          )}
        </div>
      </StyledArticleShow>
    </ContentContainer>
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
