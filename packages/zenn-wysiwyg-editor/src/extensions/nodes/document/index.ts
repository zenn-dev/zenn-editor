import TiptapDocument from '@tiptap/extension-document';

const Document = TiptapDocument.extend({
  content: 'block+ footnotes?',
});

export default Document;
