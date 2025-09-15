import { Node } from '@tiptap/react';
import { DiffPrismPlugin } from './diff-prism-plugin';
import { normalizeLanguage } from '../utils';

export interface CodeBlockOptions {
  languageClassPrefix: string;
  defaultLanguage: string;
}

export const DiffCodeBlock = Node.create<CodeBlockOptions>({
  name: 'diffCodeBlock',

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      defaultLanguage: 'plaintext',
    };
  },

  content: 'diffCodeLine+',
  marks: '',
  defining: true,

  addAttributes() {
    return {
      // diff 言語は plaintext に変換する
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => {
          const { languageClassPrefix } = this.options;
          const classNames = [...(element.firstElementChild?.classList || [])];
          const languages = classNames
            .filter((className) => className.startsWith(languageClassPrefix))
            .map((className) => className.replace(languageClassPrefix, ''));
          const languageWithDiffPrefix = languages[0];

          if (!languageWithDiffPrefix) {
            return null;
          }

          const language = languageWithDiffPrefix.replace(/^diff-/, '');

          return normalizeLanguage(language);
        },
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre:has(code.diff-highlight)',
        preserveWhitespace: 'full',
        priority: 1000, // CodeBlockよりも先に読み込む
      },
    ];
  },

  renderHTML({ node }) {
    const language =
      node.attrs.language !== 'plaintext'
        ? `diff-${node.attrs.language}`
        : 'diff';
    return [
      'pre',
      {
        class: `diff-highlight ${this.options.languageClassPrefix + language}`,
      },
      [
        'code',
        {
          class: `diff-highlight ${
            this.options.languageClassPrefix + language
          }`,
        },
        0,
      ],
    ];
  },

  addProseMirrorPlugins() {
    return [
      DiffPrismPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ];
  },
});
