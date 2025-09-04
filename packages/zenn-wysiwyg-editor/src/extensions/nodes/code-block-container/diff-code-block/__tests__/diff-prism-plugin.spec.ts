import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../../tests/editor';
import { CodeBlockContainer } from '../..';
import { CodeBlock } from '../../code-block';
import { CodeBlockFileName } from '../../code-block-file-name';
import { DiffCodeBlock } from '../../diff-code-block';
import { DiffCodeLine } from '../../diff-code-block/diff-code-line';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  CodeBlockContainer,
  CodeBlock,
  CodeBlockFileName,
  DiffCodeBlock,
  DiffCodeLine,
  HardBreak,
];

describe('DiffPrismPlugin', () => {
  const extractHighlightedToken = (codeBlockDom: Element) => {
    const tokens = Array.from(codeBlockDom?.childNodes ?? []).map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        return { class: el.className, text: el.textContent };
      } else if (node.nodeType === Node.TEXT_NODE) {
        return { class: '', text: node.textContent };
      }
      return { class: '', text: '' };
    });
    return tokens;
  };

  it('typescriptで+が挿入差分のハイライトがされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<div class="code-block-container"><div class="code-block-filename-container"></div>
        <pre><code class="language-diff-typescript diff-highlight"><span>+ console.log("hello")</span></code></pre></div>`,
    });

    // codeBlockノードのDOMを取得
    const view = editor.view;
    const codeBlockDom = view.dom.querySelector(
      'pre code.language-diff-typescript'
    );
    if (codeBlockDom == null) throw new Error('codeBlockDom is null');

    const expectedLines = [
      { class: 'token inserted-sign inserted language-typescript' },
    ];

    const expectedTokens = [
      [
        { class: 'token prefix inserted', text: '+' },
        { class: '', text: ' ' },
        { class: 'token builtin', text: 'console' },
        { class: 'token punctuation', text: '.' },
        { class: 'token function', text: 'log' },
        { class: 'token punctuation', text: '(' },
        { class: 'token string', text: '"hello"' },
        { class: 'token punctuation', text: ')' },
      ],
    ];

    const lineCount = 1;

    expect(codeBlockDom?.childNodes.length).toBe(lineCount);

    for (let i = 0; i < lineCount; i++) {
      const lineNode = codeBlockDom.children[i];
      expect(lineNode.className).toBe(expectedLines[i].class);
      const actual = extractHighlightedToken(lineNode);
      expect(actual).toEqual(expectedTokens[i]);
    }
  });

  it('空行と改行があっても差分ハイライトが認識される', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<div class="code-block-container"><div class="code-block-filename-container"></div>
        <pre><code class="language-diff-typescript diff-highlight"><span>+ const a = 1;</span><span></span><span>+ const b = 1;</span></code></pre></div>`,
    });
    // codeBlockノードのDOMを取得
    const view = editor.view;
    const codeBlockDom = view.dom.querySelector(
      'pre code.language-diff-typescript'
    );
    expect(codeBlockDom).not.toBeNull();

    const expectedLines = [
      { class: 'token inserted-sign inserted language-typescript' },
      { class: '' },
      { class: 'token inserted-sign inserted language-typescript' },
    ];

    const expectedTokens = [
      [
        { class: 'token prefix inserted', text: '+' },
        { class: '', text: ' ' },
        { class: 'token keyword', text: 'const' },
        { class: '', text: ' a ' },
        { class: 'token operator', text: '=' },
        { class: '', text: ' ' },
        { class: 'token number', text: '1' },
        { class: 'token punctuation', text: ';' },
      ],
      [
        {
          class: 'ProseMirror-trailingBreak',
          text: '',
        },
      ],
      [
        { class: 'token prefix inserted', text: '+' },
        { class: '', text: ' ' },
        { class: 'token keyword', text: 'const' },
        { class: '', text: ' b ' },
        { class: 'token operator', text: '=' },
        { class: '', text: ' ' },
        { class: 'token number', text: '1' },
        { class: 'token punctuation', text: ';' },
      ],
    ];

    const lineCount = 3;

    if (codeBlockDom == null) throw new Error('codeBlockDom is null');

    expect(codeBlockDom.childNodes.length).toBe(lineCount);

    for (let i = 0; i < lineCount; i++) {
      const lineNode = codeBlockDom.children[i];
      expect(lineNode.className).toBe(expectedLines[i].class);
      const actual = extractHighlightedToken(lineNode);
      expect(actual).toEqual(expectedTokens[i]);
    }
  });
});
