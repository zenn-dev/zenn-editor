import ItalicTiptap, {
  starInputRegex,
  underscoreInputRegex,
} from "@tiptap/extension-italic";
import { markInputRule } from "../../core/markInputRule";

export const Italic = ItalicTiptap.extend({
  addInputRules() {
    return [
      markInputRule({
        find: starInputRegex,
        type: this.type,
      }),
      markInputRule({
        find: underscoreInputRegex,
        type: this.type,
      }),
    ];
  },

  // マークダウンのペーストルールで制御
  addPasteRules() {
    return [];
  },
});
