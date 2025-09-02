import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { userEvent } from "@vitest/browser/context";
import { describe, expect, it } from "vitest";
import { waitSelectionChange } from "../../../../../tests/dom";
import { renderTiptapEditor } from "../../../../../tests/editor";
import { CodeBlockFileName } from "../../code-block-file-name";
import { DiffCodeBlock } from "../../diff-code-block";
import { DiffCodeLine } from "../../diff-code-block/diff-code-line";
import { CodeBlockContainer } from "../../index";
import { CodeBlock } from "../index";

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

describe("キーボードショートカット", () => {
  describe("Backspace", () => {
    it("コードブロックの先頭で Backspace を押すと解除", async () => {
      const editor = renderTiptapEditor({
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">Text</code></pre></div>',
        extensions: [
          Document,
          Paragraph,
          Text,
          CodeBlockContainer,
          CodeBlock,
          CodeBlockFileName,
          DiffCodeBlock,
          DiffCodeLine,
          HardBreak,
        ],
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(4).run();
      });
      await userEvent.keyboard("{Backspace}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph("Text"))');
      expect(editor.state.selection.from).toBe(1);
    });

    it("ファイル名の先頭で Backspace を押しても何も起こらない", async () => {
      const editor = renderTiptapEditor({
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">Text</code></pre></div>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(2).run();
      });
      await userEvent.keyboard("{Backspace}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")))',
      );
      expect(editor.state.selection.from).toBe(2);
    });
  });

  describe("Enter", () => {
    it("文末でEnterを三回押すとコードブロックを脱出する", async () => {
      const editor = renderTiptapEditor({
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">Text</code></pre></div>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(8).run();
      });
      await userEvent.keyboard("{Enter}{Enter}{Enter}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")), paragraph)',
      );
      expect(editor.state.selection.from).toBe(11);
    });

    it("ファイル名でEnterを押すと何も起こらない", async () => {
      const editor = renderTiptapEditor({
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">Text</code></pre></div>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(2).run();
      });
      await userEvent.keyboard("{Enter}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")))',
      );
      expect(editor.state.selection.from).toBe(2);
    });
  });
});
