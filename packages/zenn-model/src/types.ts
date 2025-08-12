export type Dect = Record<string, any>;

export type ValidationErrorType =
  | 'body'
  | 'item-slug'
  | 'missing-title'
  | 'title-length'
  | 'published-status'
  | 'published-at-parse'
  | 'published-at-schedule'
  | 'article-type'
  | 'missing-emoji'
  | 'emoji-format'
  | 'missing-topics'
  | 'too-many-topics'
  | 'topic-type'
  | 'topic-length'
  | 'invalid-topic-letters'
  | 'use-tags'
  | 'publication-name'
  | 'book-summary'
  | 'book-price-type'
  | 'book-price-range'
  | 'book-price-fraction'
  | 'missing-book-cover'
  | 'book-cover-size'
  | 'book-cover-aspect-ratio'
  | 'book-chapter-slugs'
  | 'book-chapters-format'
  | 'chapter-item-slug'
  | 'chapter-free-type';

export type ItemValidator = {
  type: ValidationErrorType;
  isCritical?: boolean;
  detailUrl?: string;
  detailUrlText?: string;
  getMessage: (item: Dect) => string;
  isValid: (item: Dect) => boolean;
};

export type ValidationError = {
  type: ValidationErrorType;
  message: string;
  isCritical: boolean;
  detailUrl?: string;
  detailUrlText?: string;
};

export type TocNode = {
  text: string;
  id: string;
  children: TocNode[];
};

export type Article = {
  slug: string;
  title?: string;
  bodyHtml?: string;
  toc?: TocNode[];
  emoji?: string;
  type?: 'tech' | 'idea';
  topics?: string[];
  tags?: string[];
  published?: boolean;
  published_at?: string | null;
  publication_name?: string | null;
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
