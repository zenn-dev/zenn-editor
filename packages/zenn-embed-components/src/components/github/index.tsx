import PrismJS from 'prismjs';
import { cssText } from './github-css';
import { EmbedGithubError } from './github-error';
import { EmbedGithubHeader } from './github-header';
import { EmbedGithubLoading } from './github-loading';
import { getGithubLinkInfo } from './utils';

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
    <div className="embed-github__container">
      <style>{cssText}</style>

      <div className="embedded-github">
        <EmbedGithubHeader url={url} linkInfo={info} />

        <pre className="language-clike">
          <code>
            {tokens.map((token) =>
              typeof token === 'string' ? (
                token
              ) : (
                <span className={`token ${token.type}`}>
                  {token.content.toString()}
                </span>
              )
            )}

            <span className="line-numbers-rows">
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
