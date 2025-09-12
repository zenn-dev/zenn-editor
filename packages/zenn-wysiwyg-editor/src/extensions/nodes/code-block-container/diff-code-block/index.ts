import { Node } from '@tiptap/react';
import { cn } from '../../../../lib/utils';
import { DiffPrismPlugin } from './diff-prism-plugin';
import { normalizeLangName } from '../utils';

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
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => {
          const { languageClassPrefix } = this.options;
          const classNames = [...(element.firstElementChild?.classList || [])];
          const languages = classNames
            .filter((className) => className.startsWith(languageClassPrefix))
            .map((className) => className.replace(languageClassPrefix, ''));
          const language = languages[0];

          if (!language) {
            return null;
          }

          return normalizeLangName(language);
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
        priority: 1000, // Codeよりも先に読み込む
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'pre',
      HTMLAttributes,
      [
        'code',
        {
          class: `diff-highlight ${
            node.attrs.language
              ? this.options.languageClassPrefix + node.attrs.language
              : null
          }`,
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'code-block-wrapper-for-langname'; // 言語名表示のポジションのため
      dom.setAttribute(
        'data-language',
        node.attrs.language || this.options.defaultLanguage
      );
      const pre = document.createElement('pre');

      const code = document.createElement('code');
      code.className = cn(
        'diff-highlight',
        node.attrs.language
          ? this.options.languageClassPrefix + node.attrs.language
          : ''
      );

      pre.appendChild(code);
      dom.appendChild(pre);

      return {
        dom,
        contentDOM: code,
      };
    };
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
