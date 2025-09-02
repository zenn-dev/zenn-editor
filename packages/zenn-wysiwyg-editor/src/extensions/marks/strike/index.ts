import StrikeTiptap, { inputRegex } from "@tiptap/extension-strike";
import { markInputRule } from "../../core/markInputRule";

export const Strike = StrikeTiptap.extend({
  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ];
  },

  // マークダウンのペーストルールで制御
  addPasteRules() {
    return [];
  },
});
