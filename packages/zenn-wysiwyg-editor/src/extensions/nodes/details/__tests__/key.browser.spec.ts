import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { userEvent } from "@vitest/browser/context";
import { describe, expect, it } from "vitest";
import { waitSelectionChange } from "../../../../tests/dom";
import { renderTiptapEditor } from "../../../../tests/editor";
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

describe("キー入力", () => {
  describe("Backspace", () => {
    it("サマリーの先頭で Backspace を押すとアコーディオンブロックが解除される", async () => {
      const editor = renderTiptapEditor({
        content:
          '<details><summary>Title</summary><div class="details-content"><p>Text</p></div></details>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(2).run();
      });
      await userEvent.keyboard("{Backspace}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph("Title"), paragraph("Text"))');
      expect(editor.state.selection.from).toBe(1);
    });
  });

  describe("Enter", () => {
    it("サマリー内かつコンテンツが閉じた状態で Enter 段落を挿入して移動する", async () => {
      const editor = renderTiptapEditor({
        content:
          '<details><summary>Title</summary><div class="details-content"><p>Text</p></div></details>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(4).run();
      });
      await userEvent.keyboard("{Enter}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(details(detailsSummary("Title"), detailsContent(paragraph("Text"))), paragraph)',
      );
      expect(editor.state.selection.from).toBe(18);
    });

    it("サマリー内かつコンテンツが開いた状態で Enter コンテンツに段落を挿入して移動する", async () => {
      const editor = renderTiptapEditor({
        content:
          '<details open="true"><summary>Title</summary><div class="details-content"><p>Text</p></div></details>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(4).run();
      });
      await userEvent.keyboard("{Enter}");

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(details(detailsSummary("Title"), detailsContent(paragraph, paragraph("Text"))))',
      );
      expect(editor.state.selection.from).toBe(10);
    });
  });
});
