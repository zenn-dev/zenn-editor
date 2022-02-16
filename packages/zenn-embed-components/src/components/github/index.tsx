import PrismJS from 'prismjs';

import { EmbedGithubError } from './EmbedGitHubError';
import { EmbedGithubHeader } from './EmbedGithubHeader';
import { EmbedGithubLoading } from './EmbedGithubLoading';

import { getGithubLinkInfo } from './utils';

import {
  embedGithubStyle,
  lineNumbersStyle,
  codeBlockThemeStyle,
} from './styles';

if (typeof window === 'object') {
  // デフォルトではAuto Highlightが有効なので、それを無効にしておく
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
  PrismJS.manual = true;
}

export interface EmbedGtihubProps {
  /** 指定されたGithubページへのリンク文字列 */
  url: string;
  /** エラー時のオブジェクト */
  error?: Error;
  /** フェッチしたソースコード文字列 */
  content?: string;
}

/**
 * Githubの埋め込み要素を表示するためのコンポーネント
 */
export const EmbedGitHub = ({ url, content, error }: EmbedGtihubProps) => {
  if (error) return <EmbedGithubError url={url} error={error} />;
  if (!content) return <EmbedGithubLoading url={url} />;

  const tokens = PrismJS.tokenize(content, PrismJS.languages.clike);

  const info = getGithubLinkInfo(url);
  const maxLine = content.replace(/\n$/, '').split('\n').length;
  const endLine = info?.endLine || maxLine;
  const startLine = (info?.startLine || 1) - 1; // startLineは１から始まるので -1 する
  const lineCount = endLine - startLine; // 表示する行数を計算する

  return (
    <div>
      <div css={embedGithubStyle}>
        <EmbedGithubHeader url={url} linkInfo={info} />

        <pre css={codeBlockThemeStyle}>
          <code className="language-clike">
            {tokens.map((token, i) =>
              typeof token === 'string' ? (
                token
              ) : (
                <span key={`token__${i}`} className={`token ${token.type}`}>
                  {token.content.toString()}
                </span>
              )
            )}

            <span css={lineNumbersStyle}>
              {[...Array(lineCount)].map((_, i) => (
                <span key={`line-number__${i}`}>{i + 1 + startLine}</span>
              ))}
            </span>
          </code>
        </pre>
      </div>
    </div>
  );
};

export { getGithubLinkInfo };
