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
  abstract?: string;
  price?: number;
  topics?: string[];
  public?: boolean;
};

export type Chapter = any;

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
  errorType: "critical" | "notice";
  message: string;
};

export type ErrorMessages = ErrorMessage[];

export type ItemValidator = ErrorMessage & {
  isInvalid: (item: Item) => boolean;
};
