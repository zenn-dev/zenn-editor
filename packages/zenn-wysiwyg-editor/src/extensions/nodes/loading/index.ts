import { Node, ReactRenderer } from '@tiptap/react';
import LoadingCard from '../../../components/editor/loading-card';

export const Loading = Node.create({
  name: 'loading',
  group: 'block',
  atom: true,
  marks: '',

  addAttributes() {
    return {
      id: {
        // ローディング後にノードを特定するため
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.loading-node',
      },
    ];
  },

  renderHTML() {
    return [
      'span',
      {
        class: 'loading-node',
      },
    ];
  },

  addNodeView() {
    return () => {
      const component = new ReactRenderer(LoadingCard, {
        editor: this.editor,
      });
      return { dom: component.element };
    };
  },
});
