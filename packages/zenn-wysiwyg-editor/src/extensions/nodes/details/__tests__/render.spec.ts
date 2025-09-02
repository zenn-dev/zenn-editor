import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
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

describe("HTMLのパース・レンダリング", () => {
  it("アコーディオンが正しいHTMLでレンダリングされる", () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<details><summary></summary><div class="details-content"><p>テキスト</p></div></details>',
    });

    const html = editor.getHTML();
    expect(html).toContain("<details>");
    expect(html).toContain("<summary></summary>");
    expect(html).toContain('<div class="details-content">');
    expect(html).toContain("<p>テキスト</p>");
    expect(html).toContain("</div>");
    expect(html).toContain("</details>");
  });
});
