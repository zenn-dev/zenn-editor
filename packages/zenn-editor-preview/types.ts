// link to each post item
export type NavItem = {
  name: string;
  realPath: string;
  dynamicRoutePath?: string;
};
// books, articles
export type NavCategory = {
  name: string;
  items: NavItem[];
};
// for navigation on sidebar
export type NavCollections = NavCategory[];
