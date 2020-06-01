export type Article = {
  content: string;
  slug: string;
  title?: string;
  emoji?: string;
  type?: "tech" | "idea";
  topics?: string[];
  tags?: string[];
  public?: boolean;
};

export type Book = any;
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
