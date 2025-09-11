import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node } from '@tiptap/pm/model';

const getDecorations = (doc: Node): DecorationSet => {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name !== 'caption') {
      return true;
    }

    // キャプションの前の要素（画像）を取得
    const imgNode = doc.nodeAt(pos - 1);
    if (!imgNode || imgNode.type.name !== 'image') {
      return true;
    }

    // 画像にLinkマークがついているかチェック
    const hasLinkMark = imgNode.marks.some((mark) => mark.type.name === 'link');

    // リンク画像ならキャプションを非表示にするデコレーションを追加
    if (hasLinkMark) {
      decorations.push(
        Decoration.node(pos, pos + node.nodeSize, {
          style: 'display: none',
        })
      );
    }

    return true;
  });

  return DecorationSet.create(doc, decorations);
};

export const captionLinkPlugin = new Plugin({
  key: new PluginKey('caption-link'),
  state: {
    init(_, state) {
      return getDecorations(state.doc);
    },
    apply(tr, decorationSet, ___, newState) {
      if (tr.docChanged === false) {
        return decorationSet.map(tr.mapping, tr.doc);
      }

      return getDecorations(newState.doc);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
