import React from 'react';
import styled from 'styled-components';
import {
  LinkArticle,
  LinkBook,
  LinkChapter,
  LinkHome,
  ToplevelLink,
} from './Routes';
import { useFetch } from '../hooks/useFetch';
import { useLocalFileChangedEffect } from '../hooks/useLocalFileChangedEffect';
import { usePersistedState } from '../hooks/usePersistedState';
import { ArticleMeta, BookMeta, ChapterMeta } from '../../common/types';
import { ListItemInner } from './sidebar/ListItemInner';
import { Directory } from './sidebar/Directory';

const ArticleLinkItem: React.VFC<{ article: ArticleMeta }> = ({ article }) => {
  return (
    <LinkArticle slug={article.slug}>
      <ListItemInner
        title={article.title || article.slug}
        label={article.published ? undefined : '下書き'}
        emoji={article.emoji || '📄'}
      />
    </LinkArticle>
  );
};

const ChapterLinkItem: React.VFC<{
  bookSlug: string;
  chapter: ChapterMeta;
  chapterNumber?: number;
}> = ({ bookSlug, chapter, chapterNumber }) => {
  const hasChapterNumber = typeof chapterNumber === 'number';

  return (
    <LinkChapter bookSlug={bookSlug} chapterFilename={chapter.filename}>
      <ListItemInner
        label={hasChapterNumber ? undefined : '除外'}
        title={`${hasChapterNumber ? `${chapterNumber}. ` : ''}${
          chapter.title || chapter.slug
        }`}
      />
    </LinkChapter>
  );
};

const ListItemBookChildren: React.VFC<{ bookSlug: string }> = ({
  bookSlug,
}) => {
  const { data, mutate } = useFetch<{ chapters: ChapterMeta[] }>(
    `/api/books/${bookSlug}/chapters`,
    {
      revalidateOnFocus: false,
    }
  );
  const chapters = data?.chapters;

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutate();
  });

  return (
    <ul>
      <li>
        <LinkBook slug={bookSlug}>
          <ListItemInner title="設定" emoji="📘" />
        </LinkBook>
      </li>
      {!!chapters?.length && (
        <>
          {chapters?.map((chapter, i) => (
            <li key={`dir-book-${bookSlug}-${chapter.slug}`}>
              <ChapterLinkItem
                bookSlug={bookSlug}
                chapter={chapter}
                chapterNumber={
                  typeof chapter.position === 'number' ? i + 1 : undefined
                }
              />
            </li>
          ))}
        </>
      )}
    </ul>
  );
};

const ListItemBook: React.VFC<{ book: BookMeta }> = ({ book }) => {
  return (
    <Directory
      title={book.title || book.slug}
      uniqueKey={`dir-book-${book.slug}`}
      defaultOpen={false}
      label={book.published ? undefined : '下書き'}
    >
      <ListItemBookChildren bookSlug={book.slug} />
    </Directory>
  );
};

const ListArticles: React.VFC = () => {
  const { data, mutate } = useFetch<{ articles: ArticleMeta[] }>(
    '/api/articles',
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
    }
  );
  const articles = data?.articles;

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutate();
  });

  return (
    <Directory title="articles" uniqueKey="dir-articles" defaultOpen={true}>
      <ul>
        {!!articles?.length && (
          <li>
            {articles.map((article) => (
              <ArticleLinkItem
                key={`item-article-${article.slug}`}
                article={article}
              />
            ))}
          </li>
        )}
      </ul>
    </Directory>
  );
};

const ListBooks: React.VFC = () => {
  const { data, mutate } = useFetch<{ books: BookMeta[] }>('/api/books', {
    revalidateOnFocus: false,
  });
  const books = data?.books;

  // refetch when local file changes
  useLocalFileChangedEffect(() => {
    mutate();
  });

  return (
    <Directory title="books" uniqueKey="dir-books" defaultOpen={true}>
      {!!books?.length && (
        <ul>
          {books?.map((book) => (
            <ListItemBook key={`item-book-${book.slug}`} book={book} />
          ))}
        </ul>
      )}
    </Directory>
  );
};

export const Sidebar: React.VFC = () => {
  const [isFolded, setIsFolded] = usePersistedState<boolean>({
    cacheKey: 'fold-sidebar',
    defaultValue: false,
  });

  return (
    <StyledSidebar aria-expanded={!isFolded} className="sidebar">
      <button
        className="sidebar__btn-fold"
        onClick={() => setIsFolded(!isFolded)}
        aria-label={isFolded ? 'メニューを開く' : '折りたたむ'}
      >
        <img
          src={`/icons/${isFolded ? 'sidebar-open.svg' : 'sidebar-fold.svg'}`}
          alt=""
          width={16}
          height={16}
        />
      </button>
      <div className="sidebar__inner" aria-hidden={isFolded}>
        <header className="sidebar__header">
          <LinkHome>
            <img
              src="/logo.svg"
              alt="Zenn Editor"
              width={150}
              height={20}
              className="site-logo"
            />
          </LinkHome>
        </header>
        <div className="sidebar__items">
          <ListArticles />
          <ListBooks />

          <ul className="sidebar__static-links">
            <li>
              <ToplevelLink
                to="guide"
                hash="cli-%E3%81%A7%E8%A8%98%E4%BA%8B%EF%BC%88article%EF%BC%89%E3%82%92%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B"
              >
                <ListItemInner title="記事の作成ガイド" emoji="📝" />
              </ToplevelLink>
            </li>
            <li>
              <ToplevelLink
                to="guide"
                hash="cli-%E3%81%A7%E6%9C%AC%EF%BC%88book%EF%BC%89%E3%82%92%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B"
              >
                <ListItemInner title="本の作成ガイド" emoji="📚" />
              </ToplevelLink>
            </li>
            <li>
              <a
                href="https://zenn.dev/zenn/articles/markdown-guide"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ListItemInner
                  title="マークダウン記法"
                  emoji="🖋️ "
                  showNewTabIcon={true}
                />
              </a>
            </li>
            <li>
              <a
                href="https://zenn.dev/dashboard/uploader"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ListItemInner
                  title="画像のアップロード"
                  emoji="📷"
                  showNewTabIcon={true}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-right: solid 1px var(--c-gray-border);
  padding: 15px;
  width: 46px;
  &[aria-expanded='true'] {
    width: 350px;
  }
  .sidebar__btn-fold {
    position: absolute;
    top: 10px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: var(--c-gray-bg);
    border-radius: 5px;
  }

  .sidebar__inner {
    &[aria-hidden='true'] {
      display: none;
    }
  }
  .sidebar__header {
    img {
      display: block;
    }
  }
  .sidebar__items {
    margin: 10px 0;
    display: block;
    font-size: 13.5px;
    a {
      margin: 2px 0;
      padding: 2px 0;
      display: block;
      color: var(--c-gray);
      &:hover {
        color: var(--c-body);
      }
      &.active {
        position: relative;
        color: var(--c-primary-darker);
        &:before {
          content: '';
          position: absolute;
          background: var(--c-primary-bg);
          top: 0;
          bottom: 0;
          left: -5px;
          right: -5px;
          z-index: -1;
          border-radius: 4px;
        }
      }
    }
  }
  .sidebar__static-links {
    margin-top: 8px;
  }
`;
