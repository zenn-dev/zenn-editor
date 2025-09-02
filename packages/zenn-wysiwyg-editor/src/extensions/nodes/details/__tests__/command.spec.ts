import Blockquote from "@tiptap/extension-blockquote";
import Document from "@tiptap/extension-document";
import { ListKit } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it } from "vitest";
import { renderTiptapEditor } from "../../../../tests/editor";
import { CodeBlockContainer } from "../../code-block-container";
import { CodeBlock } from "../../code-block-container/code-block";
import { CodeBlockFileName } from "../../code-block-container/code-block-file-name";
import { DiffCodeBlock } from "../../code-block-container/diff-code-block";
import { DiffCodeLine } from "../../code-block-container/diff-code-block/diff-code-line";
import Heading from "../../heading";
import { Details } from "..";
import { DetailsContent } from "../content";
import { DetailsSummary } from "../summary";

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Details,
  DetailsContent,
  DetailsSummary,
];

describe("コマンド", () => {
  describe("setDetails", () => {
    it("setDetailsコマンドでアコーディオンを挿入できる", () => {
      const editor = renderTiptapEditor({
        extensions: basicExtension,
        content: "<p>テキスト</p>",
      });

      editor.commands.setDetails();

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(details(detailsSummary, detailsContent(paragraph("テキスト"))))',
      );
    });

    it("setDetailsコマンドはアコーディオンタイトル内で実行できない", () => {
      const editor = renderTiptapEditor({
        extensions: basicExtension,
        content:
          '<details><summary></summary><div class="details-content"><p>テキスト</p></div></details>',
      });

      // アコーディオン外にカーソルがある場合
      editor.commands.setTextSelection(2);
      expect(editor.can().setDetails()).toBe(false);
    });

    it("見出しの中で呼び出せる", () => {
      const editor = renderTiptapEditor({
        extensions: [...basicExtension, Heading],
        content: "<h1>見出しの中</h1>",
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setDetails();

      expect(result).toBe(true);
    });

    it("引用の中で呼び出せる", () => {
      const editor = renderTiptapEditor({
        extensions: [...basicExtension, Blockquote],
        content: "<blockquote>引用の中</blockquote>",
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setDetails();

      expect(result).toBe(true);
    });

    it("リストで呼び出せない", () => {
      const editor = renderTiptapEditor({
        extensions: [...basicExtension, ListKit],
        content: "<ul><li><p>リストの中</p></li></ul>",
      });

      editor.commands.setTextSelection(4);
      const result = editor.commands.setDetails();

      expect(result).toBe(false);
    });

    it("メッセージの中で呼び出せる", () => {
      const editor = renderTiptapEditor({
        extensions: basicExtension,
        content:
          '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
      });

      editor.commands.setTextSelection(3);
      const result = editor.commands.setDetails();

      expect(result).toBe(true);
    });

    it("コードブロックのファイル名とコンテンツの中で呼び出せない", () => {
      const editor = renderTiptapEditor({
        extensions: [
          ...basicExtension,
          CodeBlock,
          CodeBlockContainer,
          CodeBlockFileName,
          DiffCodeBlock,
          DiffCodeLine,
        ],
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>',
      });

      editor.commands.setTextSelection(2);
      const result = editor.commands.setDetails();

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setDetails();

      expect(result).toBe(false);
      expect(result2).toBe(false);
    });

    it("差分コードブロックのファイル名とコンテンツの中で呼び出せない", () => {
      const editor = renderTiptapEditor({
        extensions: [
          ...basicExtension,
          CodeBlock,
          CodeBlockContainer,
          CodeBlockFileName,
          DiffCodeBlock,
          DiffCodeLine,
        ],
        content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
          <pre><code class="language-diff diff-highlight"><span>Text</span></code></pre></div>`,
      });

      editor.commands.setTextSelection(2);
      const result = editor.commands.setDetails();

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setDetails();

      expect(result).toBe(false);
      expect(result2).toBe(false);
    });

    it("アコーディオンのサマリーで呼べない。コンテンツで呼べる", () => {
      const editor = renderTiptapEditor({
        extensions: [
          ...basicExtension,
          Details,
          DetailsSummary,
          DetailsContent,
        ],
        content:
          "<details><summary>サマリー</summary><div>コンテンツ</div></details>",
      });

      editor.commands.setTextSelection(10);
      const result = editor.commands.setDetails();

      editor.commands.setTextSelection(3);
      const result2 = editor.commands.setDetails();

      expect(result).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe("unsetDetails", () => {
    it("unsetDetailsコマンドでアコーディオンを削除できる", () => {
      const editor = renderTiptapEditor({
        extensions: basicExtension,
        content:
          '<details><summary></summary><div class="details-content"><p>テキスト</p></div></details>',
      });

      editor.commands.unsetDetails();

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph, paragraph("テキスト"))');
    });

    it("unsetDetailsコマンドはアコーディオン内にカーソルがある場合にのみ有効", () => {
      const editor = renderTiptapEditor({
        extensions: basicExtension,
        content:
          '<details><summary></summary><div class="details-content"><p>テキスト</p></div></details><p>テキスト2</p>',
      });

      // アコーディオン外にカーソルがある場合
      editor.commands.setTextSelection(15);
      expect(editor.can().unsetDetails()).toBe(false);
    });
  });
});
