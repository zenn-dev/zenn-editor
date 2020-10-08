export type Article = {
  slug: string;
  content?: string;
  title?: string;
  emoji?: string;
  type?: "tech" | "idea";
  topics?: string[];
  tags?: string[];
  published?: boolean;
};

export type Book = {
  slug: string;
  title?: string;
  summary?: string;
  price?: number;
  topics?: string[];
  published?: boolean;
  coverDataUrl?: string;
  chapters?: string[];
};

export type ChapterMeta = {
  slug: string;
  title: string;
  free: boolean;
  position?: null | number;
};

export type Chapter = ChapterMeta & {
  content: string;
};

export type Item = Article | Book | Chapter;

// link to each post item
export type NavItem = {
  name: string;
  as?: string;
  href: string;
};
// books, articles
export type NavCollection = {
  name: string;
  items: NavItem[];
};
// for navigation on sidebar
export type NavCollections = NavCollection[];

export type ErrorMessage = {
  isCritical: boolean;
  message: string;
};

export type ErrorMessages = ErrorMessage[];

export type ItemValidator = {
  isCritical?: boolean;
  getMessage: (item?: Item) => string;
  isInvalid: (item: Item) => boolean;
};
