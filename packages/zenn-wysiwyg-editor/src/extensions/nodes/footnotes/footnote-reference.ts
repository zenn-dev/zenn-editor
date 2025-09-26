import { Plugin, PluginKey } from '@tiptap/pm/state';
import { AddMarkStep } from '@tiptap/pm/transform';
import { Node } from '@tiptap/react';
import { getRandomString } from '../../..//lib/random';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    footnoteReference: {
      setFootnote: () => ReturnType;
    };
  }
}

const FootnoteReference = Node.create({
  name: 'footnoteReference',
  inline: true,
  group: 'inline',
  atom: true,
  draggable: false,
  marks: '',

  addAttributes() {
    return {
      id: {
        isRequired: true,
      },
      footnoteId: {
        isRequired: true,
      },
      referenceNumber: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup.footnote-ref',
        getAttrs: (element) => {
          const anchor = element.querySelector('a');
          if (!anchor) {
            return false;
          }

          const id = anchor.getAttribute('id');
          const footnoteId = anchor.getAttribute('href')?.replace('#', '');
          const referenceNumber = anchor.textContent
            ? anchor.textContent.replace(/[[\]]/g, '')
            : null;

          if (!id || !footnoteId || !referenceNumber) {
            return false;
          }

          return {
            id,
            footnoteId,
            referenceNumber,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'sup',
      { class: 'footnote-ref' },
      [
        'a',
        {
          href: `#${node.attrs.footnoteId}`,
          id: node.attrs.id,
        },
        `[${node.attrs.referenceNumber ?? '?'}]`,
      ],
    ];
  },

  // スクロール周りはエディタで制御するため、DOMイベントは無視する
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('sup');
      dom.className = 'footnote-ref';

      const anchor = document.createElement('a');
      anchor.setAttribute('id', node.attrs.id);
      anchor.textContent = `[${node.attrs.referenceNumber ?? '?'}]`;

      dom.appendChild(anchor);

      return {
        dom,
        contentDOM: null,
      };
    };
  },

  addCommands() {
    return {
      setFootnote:
        () =>
        ({ state, chain }) => {
          const { selection } = state;
          const { $from } = selection;

          const isReplaceable = $from.parent.canReplaceWith(
            $from.index(),
            $from.index(),
            this.type
          );

          if (!isReplaceable) {
            return false;
          }

          return chain()
            .insertContent([
              {
                type: this.name,
                attrs: {
                  id: getRandomString(),
                  footnoteId: getRandomString(),
                },
              },
            ])
            .run();
        },
    };
  },

  addInputRules() {
    // [^text] の形式 (空のテキストでも良い)
    return [
      {
        find: /\[\^(.*?)\]\s$/,
        type: this.type,
        handler({ range, chain, can }) {
          if (!can().setFootnote()) {
            return null;
          }

          chain().deleteRange(range).setFootnote().run();
        },
        undoable: false, // footnoteItemのtrが発生することで、実質的に意味がない
      },
    ];
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey('footnoteRef'),

        props: {
          // 脚注にスクロール
          handleDoubleClickOn: (_, __, node, ___, event) => {
            if (node.type.name !== this.name) return false;
            event.preventDefault();
            const id = node.attrs.footnoteId;
            return editor.commands.focusFootnote(id);
          },
          // 脚注参照を選択
          handleClickOn: (_, __, node, nodePos, event) => {
            if (node.type.name !== this.name) return false;
            event.preventDefault();

            return editor.chain().setNodeSelection(nodePos).run();
          },
        },

        // 脚注参照ノードがマークを受け取っていたら削除する
        appendTransaction(transactions, _, newState) {
          const newTr = newState.tr;
          let modified = false;

          transactions.forEach((tr) => {
            tr.steps.forEach((step) => {
              if (!(step instanceof AddMarkStep)) return;

              newState.doc.nodesBetween(step.from, step.to, (node, pos) => {
                if (newState.schema.nodes.footnoteReference === node.type) {
                  modified = true;
                  newTr.removeMark(pos, pos + node.nodeSize, step.mark);
                }
              });
            });
          });

          if (modified) {
            return newTr;
          }
          return null;
        },
      }),
    ];
  },
});

export default FootnoteReference;
