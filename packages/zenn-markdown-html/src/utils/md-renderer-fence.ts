import MarkdownIt from 'markdown-it';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import { MarkdownOptions } from '../types';
import { highlight } from './highlight';

function getHtml({
  content,
  className,
  fileName,
  line,
}: {
  content: string;
  className: string;
  fileName?: string;
  line?: number;
}) {
  const escapedClass = escapeHtml(className);

  return `<div class="code-block-container">${
    fileName
      ? `<div class="code-block-filename-container"><span class="code-block-filename">${escapeHtml(
          fileName
        )}</span></div>`
      : ''
  }<pre class="${escapedClass}"><code class="${
    escapedClass !== '' ? `${escapedClass} code-line` : 'code-line'
  }" ${
    line !== undefined ? `data-line="${line}"` : ''
  }>${content}</code></pre></div>`;
}

function getClassName({
  langName = '',
  hasDiff,
}: {
  hasDiff: boolean;
  langName?: string;
}): string {
  const isSafe = /^[\w-]{0,30}$/.test(langName);
  if (!isSafe) return '';

  if (hasDiff) {
    return `diff-highlight ${
      langName.length ? `language-diff-${langName}` : ''
    }`;
  }
  return langName ? `language-${langName}` : '';
}

const fallbackLanguages: {
  [key: string]: string;
} = {
  vue: 'html',
  react: 'jsx',
  fish: 'shell',
  sh: 'shell',
  cwl: 'yaml',
  tf: 'hcl', // ref: https://github.com/PrismJS/prism/issues/1252
};

function normalizeLangName(str?: string): string {
  if (!str?.length) return '';
  const langName = str.toLocaleLowerCase();
  return fallbackLanguages[langName] ?? langName;
}

export function parseInfo(str: string): {
  hasDiff: boolean;
  langName: string;
  fileName?: string;
} {
  if (str.trim() === '') {
    return {
      langName: '',
      fileName: undefined,
      hasDiff: false,
    };
  }

  // e.g. foo:filename => ["foo", "filename"]
  // e.g. foo diff:filename => ["foo diff", "filename"]
  const [langInfo, fileName] = str.split(':');

  const langNames = langInfo.split(' ');
  const hasDiff = langNames.some((name) => name === 'diff');

  const langName: undefined | string = hasDiff
    ? langNames.find((lang) => lang !== 'diff')
    : langNames[0];

  return {
    langName: normalizeLangName(langName),
    fileName,
    hasDiff,
  };
}

export function mdRendererFence(md: MarkdownIt, options?: MarkdownOptions) {
  // override fence
  md.renderer.rules.fence = function (...args) {
    const [tokens, idx] = args;
    const { info, content } = tokens[idx];
    const { langName, fileName, hasDiff } = parseInfo(info);

    if (langName === 'mermaid') {
      const generator = options?.customEmbed?.mermaid;
      // generator が(上書きされて)定義されてない場合はそのまま出力する
      return generator ? generator(content.trim(), options) : content;
    }

    const className = getClassName({
      langName,
      hasDiff,
    });
    const highlightedContent = highlight(content, langName, hasDiff);
    const fenceStart = tokens[idx].map?.[0];

    return getHtml({
      content: highlightedContent,
      className,
      fileName,
      line: fenceStart,
    });
  };
}
