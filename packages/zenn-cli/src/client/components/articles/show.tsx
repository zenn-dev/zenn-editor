import styled from 'styled-components';
import { BodyContent } from '../BodyContent';
import { ContentContainer } from '../ContentContainer';
import { ArticleHeader } from './show/ArticleHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useTitle } from '../../hooks/useTitle';
import { Article } from 'zenn-model';
import { Toc } from '../Toc';
import { InsertAnchorButtonToHeadings } from '../InsertAnchorButtonToHeaings';

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
          <div className="article-show__content anchorToHeadings">
            {article.toc && article.toc.length > 0 && (
              <Toc maxDepth={2} toc={article.toc} />
            )}
            <InsertAnchorButtonToHeadings>
              <BodyContent rawHtml={article.bodyHtml || ''} />
            </InsertAnchorButtonToHeadings>
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

  // 見出しの隣にアンカー 🔗 を表示する
  // .header-anchor-link は見出しに設定されているクラス名
  /* .anchorToHeadings {
    .header-anchor-link {
      position: relative;

      &::before {
        position: absolute;
        top: 0.1em;
        left: -25px;
        display: block;
        width: 24px;
        height: 1em;
        padding-right: 5px;
        content: '';

        background: url('https://zenn.dev/permanent/link-gray.svg') no-repeat
          center;
        background-size: 20px 20px;
        opacity: 0;
      }
    }

    :is(h1, h2, h3, h4):hover .header-anchor-link::before {
      opacity: 1;
    }
  } */
`;
