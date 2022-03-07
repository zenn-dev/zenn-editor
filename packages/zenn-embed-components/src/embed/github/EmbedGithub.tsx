import PrismJS from 'prismjs';

import { EmbedGithubError } from './EmbedGithubError';
import { EmbedGithubHeader } from './EmbedGithubHeader';
import { EmbedGithubLoading } from './EmbedGithubLoading';
import { SendWindowSize } from '../../components/SendWindowSize';

import { getGithubLinkInfo } from './utils';
import { EmbedComponentProps } from '../types';

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

  const lines = content.replace(/\n$/, '').split('\n');
  const maxLine = lines.length;
  const info = getGithubLinkInfo(src || ''); // URL文字列から情報を取得する
  const startLine = Math.min(maxLine, info?.startLine || 1) - 1; // startLineは１から始まるので -1 する
  const endLine = Math.min(maxLine, info?.endLine || Infinity); // 最終行が未定義の場合は最大行を指定する

  const tokens = PrismJS.tokenize(
    lines.slice(startLine, endLine).join('\n'),
    PrismJS.languages.clike
  );

  return (
    <div css={embedGithubStyle}>
      <EmbedGithubHeader
        url={src}
        linkInfo={info ? { ...info, endLine } : void 0}
      />

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

          {/* 行番号を表示する */}
          <span css={lineNumbersStyle}>
            {[...Array(Math.max(endLine - startLine, 1))].map((_, i) => (
              <span key={`line-number__${i}`}>{i + 1 + startLine}</span>
            ))}
          </span>

          {/* 最後の行が改行コードだった場合、見栄えが悪くなるので改行を追加しておく */}
          <br />
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
