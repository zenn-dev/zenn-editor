import TiptapBold, {
  starInputRegex,
  underscoreInputRegex,
} from '@tiptap/extension-bold';
import { markInputRule } from '../../core/markInputRule';

export const Bold = TiptapBold.extend({
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
