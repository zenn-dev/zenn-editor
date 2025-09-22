import type { SuggestionOptions } from '@tiptap/suggestion';

export type SuggestionItem = {
  value: string;
  label: string;
  command: SuggestionOptions['command'];
};

export const items: SuggestionItem[] = [
  {
    value: 'message',
    label: 'メッセージ',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMessage({
          type: 'message',
        })
        .run();
    },
  },
  {
    value: 'alert',
    label: 'メッセージ（アラート）',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMessage({
          type: 'alert',
        })
        .run();
    },
  },
  {
    value: 'details',
    label: 'アコーディオン',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setDetails().run();
    },
  },
  {
    value: 'codeBlock',
    label: 'コードブロック',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlockContainer({
          language: 'plaintext',
          isDiff: false,
        })
        .run();
    },
  },
  {
    value: 'diffCodeBlock',
    label: '差分コードブロック',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCodeBlockContainer({
          language: 'plaintext',
          isDiff: true,
        })
        .run();
    },
  },
  {
    value: 'heading1',
    label: '見出し1',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    value: 'heading2',
    label: '見出し2',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    value: 'heading3',
    label: '見出し3',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    value: 'heading4',
    label: '見出し4',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run();
    },
  },
  {
    value: 'bulletList',
    label: '箇条書きリスト',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    value: 'orderedList',
    label: '番号付きリスト',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    value: 'blockquote',
    label: '引用',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    value: 'horizontalRule',
    label: '区切り線',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];
