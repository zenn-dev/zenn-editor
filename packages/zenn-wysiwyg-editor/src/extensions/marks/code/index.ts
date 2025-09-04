import CodeTiptap, { inputRegex } from '@tiptap/extension-code';
import { markInputRule } from '../../core/markInputRule';

export const Code = CodeTiptap.extend({
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
