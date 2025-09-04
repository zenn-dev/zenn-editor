import { TableCell as TiptapTableCell } from '@tiptap/extension-table';

export const TableCell = TiptapTableCell.extend({
  content: 'text*', // cell内にblock要素を入れない
});
