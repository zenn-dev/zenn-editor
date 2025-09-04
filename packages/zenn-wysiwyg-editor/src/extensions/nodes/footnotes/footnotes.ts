import { Node } from '@tiptap/react';
import { FootnotesDecorationsPlugin } from './plugins/footnotes-decorations';
import { FootnotesRulesPlugin } from './plugins/footnotes-rules';

const Footnotes = Node.create({
  name: 'footnotes',
  content: 'footnotesList',
  isolating: true,
  defining: true,
  draggable: false,

  parseHTML() {
    return [
      {
        tag: 'section.footnotes',
      },
    ];
  },

  renderHTML() {
    return ['section', { class: 'footnotes' }, 0];
  },

  addProseMirrorPlugins() {
    return [FootnotesDecorationsPlugin, FootnotesRulesPlugin];
  },
});

export default Footnotes;
