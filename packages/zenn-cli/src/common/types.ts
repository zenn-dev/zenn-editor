export type Article = {
  slug: string;
  title?: string;
  bodyHtml?: string;
  emoji?: string;
  type?: 'tech' | 'idea';
  topics?: string[];
  tags?: string[];
  published?: boolean;
};

export type ArticleMeta = Omit<Article, 'bodyHtml'>;

export type Book = {
  slug: string;
  title?: string;
  summary?: string;
  price?: number;
  topics?: string[];
  tags?: string[];
  published?: boolean;
  specifiedChapterSlugs?: string[];
  chapterOrderedByConfig: boolean;
  coverDataUrl?: string;
  coverFilesize?: number;
  coverWidth?: number;
  coverHeight?: number;
};

export type BookMeta = Omit<
  Book,
  'coverDataUrl' | 'coverFilesize' | 'coverWidth' | 'coverHeight'
>;

export type Chapter = {
  slug: string;
  filename: string;
  title?: string;
  free?: boolean;
  bodyHtml?: string;
  position: null | number;
};

export type ChapterMeta = Omit<Chapter, 'bodyHtml'>;
