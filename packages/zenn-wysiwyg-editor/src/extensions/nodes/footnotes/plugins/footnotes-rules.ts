import { Plugin, PluginKey } from "@tiptap/pm/state";
import { isFootnoteRefChanged, updateFootnotes } from "../utils";

export const FootnotesRulesPlugin = new Plugin({
  key: new PluginKey("footnoteRules"),
  filterTransaction(tr) {
    const { from, to } = tr.selection;

    // 全選択の場合は許可
    if (from === 0 && to === tr.doc.content.size) return true;

    let selectedFootnotes = false;
    let selectedContent = false;
    let footnoteCount = 0;

    tr.doc.nodesBetween(from, to, (node, _, parent) => {
      if (parent?.type.name === "doc" && node.type.name !== "footnotes") {
        selectedContent = true;
      } else if (node.type.name === "footnoteItem") {
        footnoteCount += 1;
      } else if (node.type.name === "footnotes") {
        selectedFootnotes = true;
      }
    });
    const overSelected = selectedContent && selectedFootnotes;

    // コンテンツと脚注を跨ぐ or 脚注アイテムを跨ぐ トランザクションは不可
    return !overSelected && footnoteCount <= 1;
  },

  // 脚注参照が追加・削除・移動時に、脚注関連を更新する
  appendTransaction(transactions, _, newState) {
    const newTr = newState.tr;

    if (isFootnoteRefChanged(transactions)) {
      updateFootnotes(newTr, newState);
      return newTr;
    }

    return null;
  },

  props: {
    // drop無効化
    handleDrop: (view, event) => {
      const { pos } = view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      }) || { pos: 0 };

      // dropターゲットがfootnotesノード内かチェック
      const $pos = view.state.doc.resolve(pos);
      let inFootnotes = false;

      for (let i = $pos.depth; i > 0; i--) {
        if ($pos.node(i).type.name === "footnotes") {
          inFootnotes = true;
          break;
        }
      }

      // footnotesノード内へのdropを防ぐ
      if (inFootnotes) {
        event.preventDefault();
        return true;
      }

      return false;
    },
  },
});
