import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const getDecorations = (doc: ProseMirrorNode) => {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name === 'footnotes') {
      const span = document.createElement('span');
      span.className = 'footnotes-title';
      span.textContent = '脚注';

      decorations.push(Decoration.widget(pos + 1, span));
    }
  });

  return DecorationSet.create(doc, decorations);
};

export const FootnotesDecorationsPlugin = new Plugin({
  key: new PluginKey('footnotesDecorations'),
  state: {
    init(_, { doc }) {
      return getDecorations(doc);
    },
    apply(tr, value) {
      const { doc } = tr;

      // TODO: より緻密な更新判定
      if (!tr.docChanged) {
        return value;
      }

      return getDecorations(doc);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
