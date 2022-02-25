export interface LinkData {
  url: string;
  title: string;
  hostname: string;
  urlOrigin?: string;
  imageUrl?: string;
  description?: string;
  shouldNofollow?: boolean;
}

export interface GithubRepoData {
  url: string;
  name: string;
  owner: string;
  fullName: string;
  language?: string;
  forksCount?: number;
  description?: string;
  stargazersCount?: number;
}
