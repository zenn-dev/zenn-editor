import { Node } from "@tiptap/react";
import { getEmbedTypeFromElement } from "../../../lib/embed";
import { generateEmbedOutputSpec } from "./generate-embed-output-spec";

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  marks: "",

  addAttributes() {
    return {
      url: {
        default: null,
        rendered: false,
      },
      type: {
        default: null,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span.embed-block",
        priority: 100,
        getAttrs: (element) => {
          const iframe = element.querySelector("iframe");
          if (!iframe) return false;
          const dataContent = iframe.getAttribute("data-content");
          const src = iframe.getAttribute("src");
          // サーバー埋め込みのノードのみ data-content を持つため、優先的に取得する。
          const url = dataContent || src;
          if (!url) return false;

          const decodedUrl = decodeURIComponent(url);

          const type = getEmbedTypeFromElement(element);
          if (!type) return false;
          return {
            url: decodedUrl,
            type: type,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return generateEmbedOutputSpec(node.attrs.type, node.attrs.url);
  },
});
