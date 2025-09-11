import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it, vi } from 'vitest';
import { renderTiptapEditor } from '../../../../tests/editor';
import Heading from '..';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Heading,
];

describe('TocPlugin', () => {
  it('h1-h3見出しノードにidが自動付与される', () => {
    // Mock crypto.randomUUID
    const mockId = 'test-uuid-123';
    vi.stubGlobal('crypto', {
      randomUUID: () => mockId,
    });

    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>',
    });

    // Trigger document change
    editor.commands.insertContent(' ');

    const h1Node = editor.state.doc.child(0);
    const h2Node = editor.state.doc.child(1);
    const h3Node = editor.state.doc.child(2);

    expect(h1Node.attrs.id).toBe(mockId);
    expect(h2Node.attrs.id).toBe(mockId);
    expect(h3Node.attrs.id).toBe(mockId);

    vi.unstubAllGlobals();
  });

  it('h4以上の見出しノードにはidが付与されない', () => {
    // Mock crypto.randomUUID
    const mockId = 'test-uuid-123';
    vi.stubGlobal('crypto', {
      randomUUID: () => mockId,
    });

    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: '<h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6>',
    });

    // Trigger document change
    editor.commands.insertContent(' ');

    const h4Node = editor.state.doc.child(0);
    const h5Node = editor.state.doc.child(1);
    const h6Node = editor.state.doc.child(2);

    expect(h4Node.attrs.id).toBeNull();
    expect(h5Node.attrs.id).toBeNull();
    expect(h6Node.attrs.id).toBeNull();

    vi.unstubAllGlobals();
  });
});