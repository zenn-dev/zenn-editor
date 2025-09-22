import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Editor, ReactRenderer } from '@tiptap/react';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

import Combobox from '../../../components/ui/combobox';
import { LANGUAGE_ALIAS_ITEMS, LANGUAGE_ITEMS } from './lang';
import DiffSwitch from '../../../components/editor/diff-switch';

interface CodeBlockSettingsDecorationPluginOptions {
  names: string[];
  editor: Editor;
}

const createCombobox = (editor: Editor, node: ProseMirrorNode, pos: number) => {
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

const createDiffToggleSwitch = (
  editor: Editor,
  node: ProseMirrorNode,
  pos: number
) => {
  const isDiff = node.type.name === 'diffCodeBlock';

  const switchRenderer = new ReactRenderer(DiffSwitch, {
    editor: editor,
    props: {
      checked: isDiff,
      onChange: (newIsDiff: boolean) => {
        editor.chain().changeDiffMode(pos, newIsDiff).run();
      },
    },
  });

  switchRenderer.element.classList.add('code-block-diff-toggle');
  return switchRenderer;
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
    let switchRenderer: ReactRenderer | null = null;

    // コンボボックスとdiff切り替えスイッチをファイル名とコードブロックの中間に配置
    const decoration = Decoration.widget(
      pos,
      (_, getPos) => {
        const container = document.createElement('div');
        container.className = 'code-block-wrapper-for-settings';

        const pos = getPos();
        if (pos === undefined) {
          throw new Error('getPos() returned undefined');
        }

        switchRenderer = createDiffToggleSwitch(editor, node, pos);
        comboboxRenderer = createCombobox(editor, node, pos);

        container.appendChild(switchRenderer.element);
        container.appendChild(comboboxRenderer.element);

        return container;
      },
      {
        side: -1,
        destroy: () => {
          console.log('destroy');
          comboboxRenderer?.destroy();
          comboboxRenderer = null;
          switchRenderer?.destroy();
          switchRenderer = null;
        },
      }
    );

    decorations.push(decoration);
  });

  return DecorationSet.create(doc, decorations);
}

export function CodeBlockSettingsDecorationPlugin({
  names,
  editor,
}: CodeBlockSettingsDecorationPluginOptions) {
  const pluginKey = new PluginKey('codeBlockSettings');

  const plugin: Plugin = new Plugin({
    key: pluginKey,

    state: {
      init: (_, { doc }) => getDecorations(doc, names, editor),
      apply: (transaction, decorationSet) => {
        if (transaction.docChanged) {
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
