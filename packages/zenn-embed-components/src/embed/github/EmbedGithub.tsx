import PrismJS from 'prismjs';

import { EmbedGithubError } from './EmbedGithubError';
import { EmbedGithubHeader } from './EmbedGithubHeader';
import { EmbedGithubLoading } from './EmbedGithubLoading';
import { SendWindowSize } from '../../components/SendWindowSize';

import { getGithubLinkInfo, slicePrismJSTokens } from './utils';
import { PrismToken, EmbedComponentProps } from '../types';

import {
  embedGithubStyle,
  lineNumbersStyle,
  codeBlockThemeStyle,
} from './styles';

export interface EmbedGtihubProps extends EmbedComponentProps {
  /** フェッチしたソースコード文字列 */
  content?: string;
}

if (typeof window === 'object') {
  // デフォルトではAuto Highlightが有効なので、それを無効にしておく
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
  PrismJS.manual = true;
}

/**
 * Githubの埋め込み要素を表示するためのコンポーネント
 */
const View = ({ src, error, content, isLoading }: EmbedGtihubProps) => {
  if (error) return <EmbedGithubError url={src} error={error} />;
  if (isLoading) return <EmbedGithubLoading url={src} />;
  if (!content) return <p>Not Found.</p>;

  const tokens = PrismJS.tokenize(content, PrismJS.languages.clike);

  const info = getGithubLinkInfo(src || ''); // URL文字列から情報を取得する
  const startLine = (info?.startLine || 1) - 1; // startLineは１から始まるので -1 する
  const endLine = info?.endLine || content.replace(/\n$/, '').split('\n').length; // prettier-ignore

  // 表示するtokenを格納する配列
  const displayTokens: PrismToken[] = info?.endLine
    ? tokens
    : slicePrismJSTokens(tokens, startLine, endLine);

  return (
    <div css={embedGithubStyle}>
      <EmbedGithubHeader
        url={src}
        linkInfo={info ? { ...info, endLine } : void 0}
      />

      <pre css={codeBlockThemeStyle}>
        <code className="language-clike">
          {displayTokens.map((token, i) =>
            typeof token === 'string' ? (
              token
            ) : (
              <span key={`token__${i}`} className={`token ${token.type}`}>
                {token.content.toString()}
              </span>
            )
          )}

          {/* 行番号を表示する */}
          <span css={lineNumbersStyle}>
            {[...Array(endLine - startLine)].map((_, i) => (
              <span key={`line-number__${i}`}>{i + 1 + startLine}</span>
            ))}
          </span>
        </code>
      </pre>
    </div>
  );
};

export const EmbedGithub = (props: EmbedGtihubProps) => {
  return (
    <SendWindowSize id={props.id} className="embed-github">
      <View {...props} />
    </SendWindowSize>
  );
};
