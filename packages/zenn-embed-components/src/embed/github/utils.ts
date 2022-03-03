import { PrismToken } from '../types';

/**
 * @param branch Hash文字列 又は 任意のブランチ名
 * @returns 7文字のHash文字列 又は 任意のブランチ名
 */
export const formatBranchName = (branch: string): string => {
  return /[a-z0-9]{40}/.test(branch)
    ? branch.slice(0, 7) // そのままだと長いので7文字にする
    : decodeURI(branch); // decodeURIは日本語名のブランチに対応するため
};

// Github REST APIのリクエストに必要な情報をパーマリンクから取得するための正規表現
export const GITHUB_PERMALINK_PATTERN =
  /^https:\/\/github\.com\/([a-zA-Z0-9-]{0,38})\/([a-zA-Z0-9-]{0,38})\/blob\/([^~\s:?[*^/\\]{2,})\/([\w!\-_~.*%()'"/]+)(?:#L(\d+)(?:-L(\d+))?)?/;

/**
 * Githubのパーマリンクから得られる情報の型
 */
export type GithubLinkInfo = {
  repo: string;
  owner: string;
  branch: string;
  filePath: string;
  startLine: number;
  endLine?: number;
};

/**
 * GithubのページURLから必要な情報を抜き出す
 * @param url GithubのページURL
 */
export const getGithubLinkInfo = (url: string): GithubLinkInfo | undefined => {
  const result = url.match(GITHUB_PERMALINK_PATTERN);

  if (!result) return;

  const [, owner, repo, branch, filePath, startLine, endLine] = result;

  const _startLine = +startLine > 0 ? +startLine : 1;
  const _endLine = +endLine || 0;

  return {
    repo,
    owner,
    branch,
    filePath,
    startLine: _startLine,
    endLine: _endLine > _startLine ? _endLine : void 0,
  };
};
