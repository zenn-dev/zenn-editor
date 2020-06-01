export type Article = {
  content: string;
  slug: string;
  title?: string;
  emoji?: string;
  topics?: string[];
  tags?: string[];
  public?: boolean;
};

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
