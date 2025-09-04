import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../../tests/editor';
import { CodeBlockContainer } from '../..';
import { CodeBlockFileName } from '../../code-block-file-name';
import { DiffCodeBlock } from '../../diff-code-block';
import { DiffCodeLine } from '../../diff-code-block/diff-code-line';
import { CodeBlock } from '../index';

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

describe('PrismPlugin', () => {
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

  it('typescriptでconsole.logをコードブロックで入力するとハイライトがされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"></div><pre><code class="language-typescript">console.log("hello")</code></pre></div>',
    });

    // codeBlockノードのDOMを取得
    const view = editor.view;
    const codeBlockDom = view.dom.querySelector('pre code.language-typescript');
    if (!codeBlockDom) {
      throw new Error('codeBlockDom is null');
    }

    const expected = [
      { class: 'token builtin', text: 'console' },
      { class: 'token punctuation', text: '.' },
      { class: 'token function', text: 'log' },
      { class: 'token punctuation', text: '(' },
      { class: 'token string', text: '"hello"' },
      { class: 'token punctuation', text: ')' },
    ];

    const actual = extractHighlightedToken(codeBlockDom);

    expect(actual).toEqual(expected);
  });

  it('空行と改行があってもハイライトが認識される', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"></div><pre><code class="language-typescript">// コメント\n\nconst a = 1;</code></pre></div>',
    });

    // codeBlockノードのDOMを取得
    const view = editor.view;
    const codeBlockDom = view.dom.querySelector('pre code.language-typescript');
    if (!codeBlockDom) {
      throw new Error('codeBlockDom is null');
    }

    const expected = [
      { class: 'token comment', text: '// コメント' },
      { class: '', text: '\n\n' },
      { class: 'token keyword', text: 'const' },
      { class: '', text: ' a ' },
      { class: 'token operator', text: '=' },
      { class: '', text: ' ' },
      { class: 'token number', text: '1' },
      { class: 'token punctuation', text: ';' },
    ];

    const actual = extractHighlightedToken(codeBlockDom);

    expect(actual).toEqual(expected);
  });

  it('コードを更新されてもハイライトされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"></div><pre><code class="language-typescript">console.log("hello")</code></pre></div>',
    });

    // codeBlockノードのDOMを取得
    const view = editor.view;
    const codeBlockDom = view.dom.querySelector('pre code.language-typescript');
    if (!codeBlockDom) {
      throw new Error('codeBlockDom is null');
    }

    // コードを更新
    editor.commands.insertContentAt(24, ';'); // console.log("hello") の後ろに ; を追加

    const expected = [
      { class: 'token builtin', text: 'console' },
      { class: 'token punctuation', text: '.' },
      { class: 'token function', text: 'log' },
      { class: 'token punctuation', text: '(' },
      { class: 'token string', text: '"hello"' },
      { class: 'token punctuation', text: ')' },
      { class: 'token punctuation', text: ';' },
    ];
    const actual = extractHighlightedToken(codeBlockDom);
    expect(actual).toEqual(expected);
  });

  it('コード全体を更新されてもハイライトされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"></div><pre><code class="language-typescript">console.log("hello")</code></pre></div>',
    });

    // codeBlockノードのDOMを取得
    const view = editor.view;
    const codeBlockDom = view.dom.querySelector('pre code.language-typescript');
    if (!codeBlockDom) {
      throw new Error('codeBlockDom is null');
    }

    // コードを更新
    editor.commands.setContent(
      '<div class="code-block-container"><div class="code-block-filename-container"></div><pre><code class="language-typescript">// コメント</code></pre></div>'
    );

    const expected = [{ class: 'token comment', text: '// コメント' }];
    const actual = extractHighlightedToken(codeBlockDom);
    expect(actual).toEqual(expected);
  });
});
