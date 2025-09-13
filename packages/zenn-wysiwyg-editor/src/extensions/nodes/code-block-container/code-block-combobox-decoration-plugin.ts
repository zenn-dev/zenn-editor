import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Editor, findChildren, ReactRenderer } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

import Combobox from '../../../components/ui/combobox';
import { LANGUAGE_ALIAS_ITEMS, LANGUAGE_ITEMS } from './lang';

interface CodeBlockComboboxOptions {
  names: string[];
  editor: Editor;
}

const createCombobox = (editor: Editor, node: ProseMirrorNode, pos: number) => {
  // ReactRendererのeditorプロパティには、実際のEditorインスタンスを渡す必要がある
  // viewからエディターを取得する適切な方法を使用
  const comboboxRenderer = new ReactRenderer(Combobox, {
    editor: editor,
    props: {
      items: LANGUAGE_ITEMS,
      aliasItems: LANGUAGE_ALIAS_ITEMS,
      value: node.attrs.language,
      onSelect: (value: string) => {
        const { state, dispatch } = editor.view;
        const { tr } = state;

        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          language: value,
        });

        dispatch(tr);
      },
    },
  });

  comboboxRenderer.element.classList.add('code-block-lang-combobox');
  return comboboxRenderer;
};

function getDecorations(
  doc: ProseMirrorNode,
  names: string[],
  editor: Editor
): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (!names.includes(node.type.name)) {
      return;
    }

    let comboboxRenderer: ReactRenderer | null = null;

    // コンボボックスをファイル名とコードブロックの中間に配置するs
    const decoration = Decoration.widget(
      pos,
      () => {
        const container = document.createElement('div');
        container.className = 'code-block-wrapper-for-langname';

        comboboxRenderer = createCombobox(editor, node, pos);

        container.appendChild(comboboxRenderer.element);

        return container;
      },
      {
        side: -1,
        destroy: () => {
          comboboxRenderer?.destroy();
          comboboxRenderer = null;
        },
      }
    );

    decorations.push(decoration);
  });

  return DecorationSet.create(doc, decorations);
}

export function CodeBlockComboboxDecorationPlugin({
  names,
  editor,
}: CodeBlockComboboxOptions) {
  const pluginKey = new PluginKey('codeBlockCombobox');

  const plugin: Plugin = new Plugin({
    key: pluginKey,

    state: {
      init: (_, { doc }) => getDecorations(doc, names, editor),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name;
        const newNodeName = newState.selection.$head.parent.type.name;
        const oldNodes = findChildren(oldState.doc, (node) =>
          names.includes(node.type.name)
        );
        const newNodes = findChildren(newState.doc, (node) =>
          names.includes(node.type.name)
        );

        if (
          transaction.docChanged &&
          // Apply decorations if:
          // selection includes named node,
          (names.includes(oldNodeName) ||
            names.includes(newNodeName) ||
            // OR transaction adds/removes named node,
            newNodes.length !== oldNodes.length ||
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            transaction.steps.some((step) => {
              return (
                // @ts-expect-error
                step.from !== undefined &&
                // @ts-expect-error
                step.to !== undefined &&
                oldNodes.some((node) => {
                  return (
                    // @ts-expect-error
                    node.pos >= step.from &&
                    // @ts-expect-error
                    node.pos + node.node.nodeSize <= step.to
                  );
                })
              );
            }))
        ) {
          return getDecorations(transaction.doc, names, editor);
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },

    props: {
      decorations(state) {
        return plugin.getState(state);
      },
    },
  });

  return plugin;
}
