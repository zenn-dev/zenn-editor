import { Plugin, PluginKey } from '@tiptap/pm/state';
import { findParentNode, InputRule, Node } from '@tiptap/react';
import { getSliceText } from '../../../lib/node';
import { extractImageUrlAndAlt, isImageURL } from '../../../lib/url';

export interface SetFigureOptions {
  src: string;
  alt?: string;
  caption?: string;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (options: SetFigureOptions) => ReturnType;
      clearFigure: () => ReturnType;
    };
  }
}

// ![image](src)
export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)\))\s$/;

// 埋め込みよりも優先度を高くする
export const Figure = Node.create({
  name: 'figure',

  group: 'block',
  content: 'image caption',
  isolating: true,
  draggable: true,
  selectable: true,
  marks: 'link',

  parseHTML() {
    return [
      {
        tag: 'p:has(img)', // Zennのレンダリングでは、キャプションなしがemを含まない
        priority: 200, // 段落よりも優先度を高くする
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setFigure:
        (options) =>
        ({ commands, state }) => {
          const { selection } = state;
          const range = selection.$from.blockRange(selection.$to);

          if (!range) {
            return false;
          }

          const isParentMatch = range.parent.type.contentMatch.matchType(
            this.type
          );

          if (!isParentMatch) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'image',
                attrs: {
                  src: options.src,
                  alt: options.alt || '',
                },
              },
              {
                type: 'caption',
                content: options.caption
                  ? [{ type: 'text', text: options.caption }]
                  : [],
              },
            ],
          });
        },
      clearFigure:
        () =>
        ({ commands, state }) => {
          const { selection } = state;
          const parent = findParentNode((node) => node.type.name === this.name)(
            selection
          );

          if (!parent) return false;

          return commands.deleteRange({
            from: parent.pos,
            to: parent.pos + parent.node.nodeSize,
          });
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: inputRegex,
        handler: ({ match, chain, range, can }) => {
          const [, , alt, src] = match;

          if (!can().setFigure({ src, alt })) {
            return;
          }

          chain().deleteRange(range).setFigure({ src, alt }).run();
        },
        undoable: false,
      }),
    ];
  },

  /* 埋め込みのペーストハンドラーよりも先に実行する */
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageURLPasteHandler'),
        props: {
          handlePaste: (view, _, slice) => {
            const { state } = view;
            const { selection } = state;
            const { empty } = selection;

            // 範囲選択の場合はデフォルトのリンクテキストの挙動にする
            if (!empty) {
              return false;
            }

            let url: string | undefined, alt: string | undefined;

            const textContent = getSliceText(slice);
            const params = extractImageUrlAndAlt(textContent);
            if (params) {
              url = params.url;
              alt = params.alt;
            } else if (isImageURL(textContent)) {
              url = textContent;
              alt = '';
            }

            if (!url) return false;

            if (!this.editor.can().setFigure({ src: url, alt })) {
              return false;
            }

            this.editor
              .chain()
              .deleteRange({ from: selection.from, to: selection.to })
              .setFigure({ src: url, alt })
              .run();
            return true;
          },
        },
      }),
    ];
  },
});

export default Figure;
