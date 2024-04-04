import Prism, { Grammar } from 'prismjs';
import { escapeHtml } from 'markdown-it/lib/common/utils';
import { enableDiffHighlight } from '../prism-plugins/prism-diff-highlight';

// diffプラグインを有効化
enableDiffHighlight();

function highlightContent({
  text,
  prismGrammar,
  langName,
  hasDiff,
}: {
  text: string;
  prismGrammar?: Grammar;
  langName?: string;
  hasDiff: boolean;
}): string {
  if (prismGrammar && langName) {
    if (hasDiff)
      return Prism.highlight(text, Prism.languages.diff, `diff-${langName}`);

    return Prism.highlight(text, prismGrammar, langName);
  }

  if (hasDiff) return Prism.highlight(text, Prism.languages.diff, 'diff');
  return escapeHtml(text);
}

export function highlight(
  text: string,
  langName: string,
  hasDiff: boolean
): string {
  const prismGrammar = Prism.languages[langName];
  return highlightContent({ text, prismGrammar, langName, hasDiff });
}
