import { Extension } from '@tiptap/react';
import { createSuggestion } from './suggestion-plugin';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [createSuggestion(this.editor)];
  },
});
