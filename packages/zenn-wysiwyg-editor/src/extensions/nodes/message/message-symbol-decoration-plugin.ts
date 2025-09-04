import type { Node } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export function createMessageSymbolDecorationPlugin(nodeName: string) {
  function getDecorations(doc: Node): DecorationSet {
    const decorations: Decoration[] = [];

    doc.descendants((node: Node, pos: number) => {
      if (node.type.name === nodeName) {
        decorations.push(
          Decoration.widget(pos + 1, () => {
            const element = document.createElement('span');
            element.className = 'msg-symbol';
            element.textContent = '!';
            return element;
          })
        );
      }
    });

    return DecorationSet.create(doc, decorations);
  }

  return new Plugin({
    key: new PluginKey('messageSymbolDecoration'),
    state: {
      init(_, { doc }) {
        return getDecorations(doc);
      },
      apply(tr, oldDecorations) {
        if (!tr.docChanged) {
          return oldDecorations.map(tr.mapping, tr.doc);
        }

        return getDecorations(tr.doc);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}
