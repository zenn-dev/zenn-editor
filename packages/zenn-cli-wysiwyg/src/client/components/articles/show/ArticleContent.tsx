import styled from 'styled-components';
import { Toc } from '../../Toc';
import { EditableBodyContent } from '../../EditableBodyContent';
import { BodyContent } from '../../BodyContent';
import { Switch } from '../../Switch';
import { Article } from 'zenn-model';
import { useCallback, useState } from 'react';
import { useWebSocket } from '../../../hooks/useLocalFileChangedEffect';
import { ContentContainer } from '../../ContentContainer';
import { WS_ArticlePostMessage } from 'common/types';
import { uploadImage } from '../../../lib/api';
import { showToast } from '../../../lib/toast';

interface ArticleContentProps {
  article: Article;
  localArticleChangedAt: number; // 直接ファイルが更新された時に、エディタを再レンダリングするためのキー
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  article,
  localArticleChangedAt,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const ws = useWebSocket();

  const handleContentChange = useCallback(
    (markdown: string) => {
      // 本番環境でのみWebSocket連携
      if (import.meta.env.MODE === 'production') {
        const req: WS_ArticlePostMessage = {
          type: 'contentChanged',
          data: { article: { ...article, markdown } },
        };

        if (ws?.readyState !== WebSocket.OPEN) {
          showToast(
            '記事の保存に失敗しました。ページをリロードしてください。',
            'error'
          );
          console.error('WebSocket is not open. readyState=' + ws?.readyState);
          return;
        }

        ws?.send(JSON.stringify(req));
      }
    },
    [article]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      const url = await uploadImage(file, article.slug);
      return url;
    },
    [article.slug]
  );

  return (
    <ContentContainer>
      <StyledArticleShow className="article-show">
        <div className="article-show__content">
          <StyledEditMode>
            <StyledLabel>編集モード</StyledLabel>
            <Switch checked={isEditable} onChange={setIsEditable} />
          </StyledEditMode>

          {isEditable ? (
            <EditableBodyContent
              key={localArticleChangedAt}
              markdown={article.markdown ?? ''}
              onChange={handleContentChange}
              onImageUpload={handleImageUpload}
            />
          ) : (
            <>
              {article.toc && article.toc.length > 0 && (
                <Toc maxDepth={2} toc={article.toc} />
              )}
              <BodyContent rawHtml={article.bodyHtml ?? ''} />
            </>
          )}
        </div>
      </StyledArticleShow>
    </ContentContainer>
  );
};

const StyledArticleShow = styled.div`
  .article-show__content {
    padding: 2rem 0 18rem;
  }
`;

const StyledEditMode = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StyledLabel = styled.label`
  cursor: pointer;
  border-bottom: 1px dashed var(--c-gray-border);
`;
