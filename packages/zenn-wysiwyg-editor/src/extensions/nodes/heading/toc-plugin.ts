import { Plugin, PluginKey } from '@tiptap/pm/state';

export function TocPlugin(name: string) {
  const tocPlugin: Plugin = new Plugin({
    key: new PluginKey('tocPlugin'),
    appendTransaction(transactions, _, newState) {
      const tr = newState.tr;
      let modified = false;

      if (!transactions.some((tr) => tr.docChanged)) {
        return;
      }

      const doc = newState.doc;
      doc.descendants((node, pos) => {
        if (node.type.name === name) {
          // h1, h2, h3のみ対象
          if (node.attrs.level > 3) {
            return;
          }

          // idが設定されていない場合のみ
          if (node.attrs.id != null) {
            return;
          }

          const id = crypto.randomUUID();
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            id: id,
          });
          modified = true;
        }
      });

      return modified ? tr : null;
    },
  });
  return tocPlugin;
}
