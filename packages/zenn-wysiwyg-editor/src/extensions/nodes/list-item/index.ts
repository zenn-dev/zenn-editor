import { ListItem as TiptapListItem } from '@tiptap/extension-list/item';

export const ListItem = TiptapListItem.extend({
  content: 'paragraph (paragraph | bulletList | orderedList)*',
});
