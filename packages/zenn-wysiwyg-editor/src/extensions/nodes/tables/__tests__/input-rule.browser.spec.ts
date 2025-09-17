import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { TableCell } from '../cell';
import { TableHeader } from '../header';
import { Table } from '../table';
import { TableRow } from '@tiptap/extension-table';

const basicExtensions = [
  Document,
  Paragraph,
  Text,
  Table,
  TableCell,
  TableHeader,
  TableRow,
];

describe('InputRule', () => {
  it(':::table1-1で 1×1のテーブルが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::table1-1 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(table(tableRow(tableHeader)), paragraph("Text"))'
    );
    expect(editor.state.selection.from).toBe(3);
  });

  it(':::table2-3で 2×3のテーブルが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::table2-3 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(table(tableRow(tableHeader, tableHeader, tableHeader), tableRow(tableCell, tableCell, tableCell)), paragraph("Text"))'
    );
    expect(editor.state.selection.from).toBe(3);
  });

  it(':::table3-2で 3×2のテーブルが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::table3-2 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(table(tableRow(tableHeader, tableHeader), tableRow(tableCell, tableCell), tableRow(tableCell, tableCell)), paragraph("Text"))'
    );
    expect(editor.state.selection.from).toBe(3);
  });

  it('行の途中では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(':::table1-1 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("T:::table1-1 ext"))');
  });

  it('範囲外の値では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::table0-1 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph(":::table0-1 Text"))');
  });

  it('21行以上では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::table21-1 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph(":::table21-1 Text"))');
  });

  it('21列以上では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::table1-21 ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph(":::table1-21 Text"))');
  });
});
