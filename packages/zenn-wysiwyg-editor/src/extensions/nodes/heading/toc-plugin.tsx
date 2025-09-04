import { Plugin, PluginKey } from '@tiptap/pm/state';
import markdownToHtml, { parseHeadingIds } from 'zenn-markdown-html';
import { renderMarkdown } from '@/lib/to-markdown';

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

      // NOTE: 現状は parseHeadingIds に渡す HTML が、ID付きにする必要がある。
      //       ID付与のアルゴリズムが markdownToHtml に含まれるため、描画用 HTML にしてから IDを取得している。
      const markdown = renderMarkdown(doc);
      const html = markdownToHtml(markdown);
      const headingIds = parseHeadingIds(html);

      let count = 0;
      doc.descendants((node, pos) => {
        if (node.type.name === name) {
          // h1, h2, h3のみ対象
          if (node.attrs.level > 3) {
            return;
          }

          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            id: headingIds[count++],
          });
          modified = true;
        }
      });

      return modified ? tr : null;
    },
  });
  return tocPlugin;
}
