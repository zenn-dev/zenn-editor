import { Node, ReactRenderer } from '@tiptap/react';
import { PrismPlugin } from './prism-plugin';
import Combobox from '../../../../components/ui/combobox';
import { LANGUAGE_ITEMS } from './lang';

// カスタマイズのため、TiptapのBlockquoteを直接編集する
// https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block/src/code-block.ts

export interface CodeBlockOptions {
  languageClassPrefix: string;
  defaultLanguage: string;
}

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      languageClassPrefix: 'language-',
      defaultLanguage: 'plaintext',
    };
  },

  content: 'text*',
  marks: '',
  code: true,
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

          return language;
        },
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
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
          class: node.attrs.language
            ? this.options.languageClassPrefix + node.attrs.language
            : null,
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
      code.className = node.attrs.language
        ? this.options.languageClassPrefix + node.attrs.language
        : '';
      code.textContent = node.textContent;

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

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from } = selection;

        if ($from.node().type.name !== this.name) return false;
        if (!selection.empty || $from.parentOffset > 0) return false;

        return this.editor.commands.unsetCodeBlockContainer();
      },

      // exit node on triple enter
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n');

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false;
        }

        return editor
          .chain()
          .insertContentAt($from.pos + 2, {
            type: 'paragraph',
          })
          .setTextSelection($from.pos + 2)
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos);

            return true;
          })
          .run();
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      PrismPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ];
  },
});
