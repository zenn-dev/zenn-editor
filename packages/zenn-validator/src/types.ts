export type Dect = Record<string, any>;

export type ValidationErrorType =
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
