import { ArticleHeader } from './show/ArticleHeader';
import { ErrorMessage } from '../ErrorMessage';
import { Loading } from '../Loading';
import { useFetch } from '../../hooks/useFetch';
import { useArticleChangedEffect } from '../../hooks/useLocalFileChangedEffect';
import { useTitle } from '../../hooks/useTitle';
import { Article } from 'zenn-model';
import { ArticleContent } from './show/ArticleContent';
import { useState } from 'react';

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

  const [localArticleChangedAt, setLocalArticleChangedAt] = useState<number>(0);

  useTitle(`${article?.title || slug}のプレビュー`);

  // refetch when local file changes
  useArticleChangedEffect((articleEvent) => {
    const article = articleEvent.article;
    if (slug !== article.slug) return;

    mutate(
      {
        article,
      },
      false
    );

    if (articleEvent.type === 'localArticleFileChanged') {
      // ローカルファイルが更新された場合は、エディタを再レンダリングするためにキーを更新
      setLocalArticleChangedAt(new Date().getTime());
    }
  });

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
        localArticleChangedAt={localArticleChangedAt}
      />
    </>
  );
};
