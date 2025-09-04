import { ArticleHeader } from './show/ArticleHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useLocalFileChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useTitle } from '../../hooks/useTitle';
import { Article } from 'zenn-model';
import { ArticleContent } from './show/ArticleContent';
import { useCallback } from 'react';

type ArticleShowProps = {
  slug: string;
};

export const ArticleShow: React.FC<ArticleShowProps> = ({ slug }) => {
  /* 
    WebSocketで編集をローカルのファイルに反映するが、更新されるで一定の時間がかかる。
    楽観的更新をしたいが、サーバーが返す描画用のCompleteHTMLはフロントエンドでレンダリングできない。
    編集スイッチを切り替えたタイミングで再検証を行い、編集中は toc のみ更新する。
  */
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

  const handleContentChange = useCallback(
    (article: Article) => {
      mutate({ article }, false);
    },
    [mutate]
  );

  const handleEditableSwitchChange = useCallback(
    (checked: boolean) => {
      // 編集 -> 閲覧モードのタイミングで、CompleteHTMLを取得するため再検証
      if (!checked) {
        mutate();
      }
    },
    [mutate]
  );

  if (!article) {
    if (isValidating) return <Loading margin="5rem auto" />;
    return <ErrorMessage message={error?.message} />;
  }

  return (
    <>
      <ArticleHeader article={article} />
      <ArticleContent
        key={article.slug}
        article={article}
        handleContentChange={handleContentChange}
        handleEditableSwitchChange={handleEditableSwitchChange}
      />
    </>
  );
};
