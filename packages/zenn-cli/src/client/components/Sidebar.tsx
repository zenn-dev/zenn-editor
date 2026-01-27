import styled from 'styled-components';

// icons
import {
  MdOutlineArrowBack,
  MdOutlineArrowForward,
  MdSort,
  MdOutlineLightMode,
  MdOutlineDarkMode,
  MdOutlineContrast,
} from 'react-icons/md';

// hooks
import { useFetch } from '../hooks/useFetch';
import { useLocalFileChangedEffect } from '../hooks/useLocalFileChangedEffect';
import { usePersistedState } from '../hooks/usePersistedState';
import { useTheme, ThemePreference } from '../hooks/useTheme';

// components
import { Directory } from './sidebar/Directory';
import { ListItemInner } from './sidebar/ListItemInner';
import { Settings } from './sidebar/Settings';
import { Logo } from './Logo';

// others
import { ArticleMeta, BookMeta, ChapterMeta } from 'zenn-model';
import { ItemSortType } from '../../common/types';
import {
  LinkArticle,
  LinkBook,
  LinkChapter,
  LinkGuide,
  LinkHome,
} from './Routes';

const ArticleLinkItem: React.FC<{ article: ArticleMeta }> = ({ article }) => {
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

const ChapterLinkItem: React.FC<{
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

const ListItemBookChildren: React.FC<{ bookSlug: string }> = ({ bookSlug }) => {
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

const ListItemBook: React.FC<{ book: BookMeta }> = ({ book }) => {
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

const ListArticles: React.FC<{ sort: ItemSortType }> = ({ sort }) => {
  const { data, mutate } = useFetch<{ articles: ArticleMeta[] }>(
    `/api/articles?sort=${sort}`,
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

const ListBooks: React.FC<{ sort: ItemSortType }> = ({ sort }) => {
  const { data, mutate } = useFetch<{ books: BookMeta[] }>(
    `/api/books?sort=${sort}`,
    {
      revalidateOnFocus: false,
    }
  );
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

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'システム設定' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
];

const ThemeIcon: React.FC<{ theme: ThemePreference }> = ({ theme }) => {
  switch (theme) {
    case 'light':
      return <MdOutlineLightMode className="sidebar__theme-open" />;
    case 'dark':
      return <MdOutlineDarkMode className="sidebar__theme-open" />;
    default:
      return <MdOutlineContrast className="sidebar__theme-open" />;
  }
};

export const Sidebar: React.FC = () => {
  const [isFolded, setIsFolded] = usePersistedState<boolean>({
    cacheKey: 'fold-sidebar',
    defaultValue: false,
  });
  const [sort, setSort] = usePersistedState<ItemSortType>({
    cacheKey: 'item-sort-type',
    defaultValue: 'modified',
  });
  const { themePreference, setThemePreference } = useTheme();

  return (
    <StyledSidebar aria-expanded={!isFolded} className="sidebar">
      <button
        className="sidebar__btn-fold"
        onClick={() => setIsFolded(!isFolded)}
        aria-label={isFolded ? 'メニューを開く' : '折りたたむ'}
      >
        {isFolded ? (
          <MdOutlineArrowForward className="sidebar__fold-icon" />
        ) : (
          <MdOutlineArrowBack className="sidebar__fold-icon" />
        )}
      </button>
      <div className="sidebar__inner" aria-hidden={isFolded}>
        <header className="sidebar__header">
          <LinkHome>
            <Logo width={150} height={20} className="sidebar__header-logo" />
          </LinkHome>
          <div className="sidebar__header-settings">
            <Settings
              openButtonIcon={<ThemeIcon theme={themePreference} />}
              openButtonAriaLabel="テーマ設定を開く"
              position="right"
              options={themeOptions}
              value={themePreference}
              setValue={(val) => setThemePreference(val)}
              width={180}
            />
            <Settings
              openButtonIcon={<MdSort className="sidebar__sort-open" />}
              openButtonAriaLabel="ソート設定を開く"
              position="right"
              options={[
                { value: 'modified', label: 'ファイル更新順に並べる' },
                { value: 'system', label: 'システムの表示順に従う' },
              ]}
              value={sort}
              setValue={(val) => setSort(val)}
              width={200}
            />
          </div>
        </header>
        <div className="sidebar__items">
          <ListArticles sort={sort} />
          <ListBooks sort={sort} />

          <ul className="sidebar__static-links">
            <li>
              <LinkGuide
                slug="zenn-cli-guide"
                hash="cli-%E3%81%A7%E8%A8%98%E4%BA%8B%EF%BC%88article%EF%BC%89%E3%82%92%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B"
              >
                <ListItemInner title="記事の作成ガイド" emoji="📝" />
              </LinkGuide>
            </li>
            <li>
              <LinkGuide
                slug="zenn-cli-guide"
                hash="cli-%E3%81%A7%E6%9C%AC%EF%BC%88book%EF%BC%89%E3%82%92%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B"
              >
                <ListItemInner title="本の作成ガイド" emoji="📚" />
              </LinkGuide>
            </li>
            <li>
              <LinkGuide slug="deploy-github-images">
                <ListItemInner title="画像管理ガイド" emoji="🏞" />
              </LinkGuide>
            </li>
            <li>
              <LinkGuide slug="markdown-guide">
                <ListItemInner title="マークダウン記法" emoji="🖋️" />
              </LinkGuide>
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
    top: 12px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: var(--c-gray-bg);
    border-radius: 5px;
    &:hover {
      .sidebar__fold-icon {
        color: var(--c-body);
      }
    }
  }
  .sidebar__fold-icon {
    width: 18px;
    width: 18px;
    color: var(--c-gray);
  }

  .sidebar__inner {
    &[aria-hidden='true'] {
      display: none;
    }
  }
  .sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 34px;
  }
  .sidebar__header-logo {
    flex-shrink: 0;
    display: block;
    color: var(--c-body);
  }
  .sidebar__header-settings {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sidebar__sort-open,
  .sidebar__theme-open {
    width: 22px;
    height: 22px;
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
