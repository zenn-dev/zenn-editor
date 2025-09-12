import { Node, ReactRenderer } from '@tiptap/react';
import { cn } from '../../../../lib/utils';
import { DiffPrismPlugin } from './diff-prism-plugin';
import { normalizeLanguage } from '../utils';
import Combobox from '../../../../components/ui/combobox';
import { LANGUAGE_ALIAS_ITEMS, LANGUAGE_ITEMS } from '../lang';

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
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'code-block-wrapper-for-langname'; // 言語名表示のポジションのため

      const combobox = new ReactRenderer(Combobox, {
        editor: editor,
        props: {
          items: LANGUAGE_ITEMS,
          aliasItems: LANGUAGE_ALIAS_ITEMS,
          value: node.attrs.language,
          onSelect: (value: string) => {
            editor.commands.command(({ tr }) => {
              const pos = getPos();
              if (typeof pos !== 'number') return false;

              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                language: value,
              });
              return true;
            });
          },
        },
      });
      combobox.element.classList.add('code-block-lang-combobox');
      dom.appendChild(combobox.element);

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.className = cn(
        'diff-highlight',
        node.attrs.language
          ? this.options.languageClassPrefix + 'diff-' + node.attrs.language
          : ''
      );

      pre.appendChild(code);
      dom.appendChild(pre);

      return {
        dom,
        contentDOM: code,
        destroy: () => {
          combobox.destroy();
        },
        ignoreMutation(mutation) {
          if (mutation.type === 'selection') {
            return false;
          }

          // コンボボックス内の変更で再レンダリングをしない
          return combobox.element.contains(mutation.target);
        },
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
