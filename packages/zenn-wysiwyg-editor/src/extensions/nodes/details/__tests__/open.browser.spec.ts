import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { page, userEvent } from "@vitest/browser/context";
import { describe, expect, it } from "vitest";
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

describe("アコーディオンの開閉", () => {
  it("ボタンを押して閉じる", async () => {
    const editor = renderTiptapEditor({
      content:
        '<details open><summary>Title</summary><div class="details-content"><p>Text</p></div></details>',
      extensions: basicExtension,
    });

    const button = page.getByRole("button");
    await userEvent.click(button);

    const detailsNode = editor.state.doc.firstChild;
    expect(detailsNode?.attrs.open).toBe(false);
  });

  it("ボタンを押して開く", async () => {
    const editor = renderTiptapEditor({
      content:
        '<details><summary>Title</summary><div class="details-content"><p>Text</p></div></details>',
      extensions: basicExtension,
    });

    const button = page.getByRole("button");
    await userEvent.click(button);

    const detailsNode = editor.state.doc.firstChild;
    expect(detailsNode?.attrs.open).toBe(true);
  });
});
