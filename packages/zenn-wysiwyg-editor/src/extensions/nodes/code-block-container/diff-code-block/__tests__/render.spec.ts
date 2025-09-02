import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it } from "vitest";
import { renderTiptapEditor } from "../../../../../tests/editor";
import { CodeBlockContainer } from "../..";
import { CodeBlock } from "../../code-block";
import { CodeBlockFileName } from "../../code-block-file-name";
import { DiffCodeBlock } from "..";
import { DiffCodeLine } from "../diff-code-line";

const baseExtensions = [
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

describe("HTMLのレンダリング", () => {
  it("JavaScript差分コードブロックが正しいHTMLでレンダリングされる", () => {
    const content =
      '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="diff-highlight language-diff-javascript"><span>console.log("hello");</span></code></pre></div>';
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content,
    });

    const html = editor.getHTML();
    expect(html).toBe(content);
  });

  it("diff言語の差分コードブロックが正しいHTMLでレンダリングされる", () => {
    const content =
      '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="diff-highlight language-diff"><span>plaintext code</span></code></pre></div>';
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content,
    });

    const html = editor.getHTML();
    expect(html).toBe(content);
  });
});
