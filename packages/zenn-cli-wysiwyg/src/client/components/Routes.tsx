import React, { useMemo } from 'react';
import Rocon, { useRoutes, Link as RoconLink, useLocation } from 'rocon/react';
import { Home } from './home';
import { Guide } from './guide';
import { ArticleShow } from './articles/show';
import { BookShow } from './books/show';
import { ChapterShow } from './chapters/show';
import { encodeUrlPeriod, decodeUrlPeriod } from '../lib/helper';

const articleRoutes = Rocon.Path().any('slug', {
  action: ({ slug }) => <ArticleShow slug={slug} />,
});

const bookRoutes = Rocon.Path().any('slug', {
  action: ({ slug }) => <BookShow slug={slug} />,
});

const bookChapterRoutes = bookRoutes.anyRoute
  .attach(Rocon.Path())
  .any('chapter_filename', {
    action: ({ slug, chapter_filename }) => (
      <ChapterShow
        bookSlug={slug}
        chapterFilename={decodeUrlPeriod(chapter_filename)}
      />
    ),
  });

const guideRoutes = Rocon.SingleHash('hash', { optional: true })
  .attach(Rocon.Path())
  .any('slug', {
    action: ({ slug, hash }) => <Guide slug={slug} hash={hash} />,
  });

const tovlevelRoutes = Rocon.Path()
  .exact({
    action: () => <Home />,
  })
  .route('guide', (r) => r.attach(guideRoutes))
  .route('articles', (r) => r.attach(articleRoutes))
  .route('books', (r) => r.attach(bookChapterRoutes));

export const Routes = () => {
  return useRoutes(tovlevelRoutes);
};

type LinkCommonProps = { className?: string; children: React.ReactNode };

export const LinkHome: React.VFC<LinkCommonProps> = (props) => {
  const location = useLocation();
  const isActive = useMemo(() => {
    return location.key === tovlevelRoutes.exactRoute.key;
  }, [location]);

  return (
    <RoconLink
      route={tovlevelRoutes.exactRoute}
      className={isActive ? `active ${props.className}` : props.className}
    >
      {props.children}
    </RoconLink>
  );
};

export const LinkArticle: React.VFC<
  {
    slug: string;
  } & LinkCommonProps
> = (props) => {
  const location = useLocation();
  const isActive = useMemo(() => {
    return location.pathname === `/articles/${props.slug}`;
  }, [location]);

  return (
    <RoconLink
      route={articleRoutes.anyRoute}
      match={{ slug: props.slug }}
      className={isActive ? `active ${props.className}` : props.className}
    >
      {props.children}
    </RoconLink>
  );
};

export const LinkBook: React.VFC<
  {
    slug: string;
  } & LinkCommonProps
> = (props) => {
  const location = useLocation();

  // TODO: This is not type safe.
  const isActive = useMemo(() => {
    return location.pathname === `/books/${props.slug}`;
  }, [location]);

  return (
    <RoconLink
      route={bookRoutes.anyRoute}
      match={{ slug: props.slug }}
      className={isActive ? `active ${props.className}` : props.className}
    >
      {props.children}
    </RoconLink>
  );
};

export const LinkChapter: React.VFC<
  {
    bookSlug: string;
    chapterFilename: string;
  } & LinkCommonProps
> = (props) => {
  const location = useLocation();
  // Encoding is required. Including dot in url breaks url fallback.
  // ref: https://github.com/vitejs/vite/issues/2190
  const encodedChapterFilename = encodeUrlPeriod(props.chapterFilename);

  // TODO: This is not type safe.
  const isActive = useMemo(() => {
    return (
      location.pathname === `/books/${props.bookSlug}/${encodedChapterFilename}`
    );
  }, [location]);

  return (
    <RoconLink
      route={bookChapterRoutes.anyRoute}
      match={{
        slug: props.bookSlug,
        chapter_filename: encodedChapterFilename,
      }}
      className={isActive ? `active ${props.className}` : props.className}
    >
      {props.children}
    </RoconLink>
  );
};

export const LinkGuide: React.VFC<
  {
    slug: string;
    hash?: string;
  } & LinkCommonProps
> = (props) => {
  const location = useLocation();

  // TODO: This is not type safe.
  const isActive = useMemo(() => {
    if (location.pathname !== `/guide/${props.slug}`) return false;
    if (props.hash) return location.hash === `#${props.hash}`;
    return true;
  }, [location]);

  return (
    <RoconLink
      route={guideRoutes.anyRoute}
      match={{ slug: props.slug, hash: props.hash }}
      className={isActive ? `active ${props.className}` : props.className}
    >
      {props.children}
    </RoconLink>
  );
};
