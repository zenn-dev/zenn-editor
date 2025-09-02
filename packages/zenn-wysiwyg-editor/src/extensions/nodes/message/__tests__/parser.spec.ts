import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { describe, expect, it } from "vitest";
import { renderTiptapEditor } from "../../../../tests/editor";
import { Message } from "../message";
import { MessageContent } from "../message-content";

const basicExtension = [Document, Paragraph, Text, Message, MessageContent];

describe("HTMLのパース", () => {
  it("aside.msgをメッセージノードとしてパースできる", () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(message(messageContent(paragraph("メッセージ"))))',
    );
  });

  it("aside.msg.alertをアラートタイプとしてパースできる", () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg alert"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(message(messageContent(paragraph("メッセージ"))))',
    );
  });
});
