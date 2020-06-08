export type Article = {
  slug: string;
  content?: string;
  title?: string;
  emoji?: string;
  type?: "tech" | "idea";
  topics?: string[];
  tags?: string[];
  public?: boolean;
};

export type Book = {
  slug: string;
  title?: string;
  summary?: string;
  price?: number;
  topics?: string[];
  public?: boolean;
  coverDataUrl?: string;
};

export type Chapter = {
  position: string;
  title?: string;
  content?: string;
};

export type Item = Article | Book | Chapter;

// link to each post item
export type NavItem = {
  name: string;
  realPath: string;
  dynamicRoutePath?: string;
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
