import { Node, ReactRenderer } from "@tiptap/react";
import LoadingCard from "../../../components/editor/loading-card";
import { escapeHtml } from "../../../lib/escape";
import { extractSpeakerDeckEmbedParams } from "../../../lib/url";

export const SpeakerDeckEmbed = Node.create({
  name: "speakerDeckEmbed",
  group: "block",
  atom: true,
  marks: "",

  addAttributes() {
    return {
      embedId: {
        default: null,
        rendered: false,
      },
      slideIndex: {
        default: null,
        rendered: false,
      },
      tempId: {
        // 一時的なID（ローディング後にノードを特定するため）
        default: null,
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
          const src = iframe.getAttribute("src");
          if (!src) return false;

          const decodedUrl = decodeURIComponent(src);

          const embedParams = extractSpeakerDeckEmbedParams(decodedUrl);
          if (!embedParams) return false;

          return {
            embedId: embedParams.embedId,
            slideIndex: embedParams.slideIndex,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "span",
      {
        class: "embed-block embed-speakerdeck",
      },
      [
        "iframe",
        {
          src: `https://speakerdeck.com/player/${escapeHtml(node.attrs.embedId)}?slide=${escapeHtml(node.attrs.slideIndex || "1")}`,
          scrolling: "no",
          allowfullscreen: true,
          loading: "lazy",
          allow: "encrypted-media",
        },
      ],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement("span");
      span.setAttribute("class", "embed-block embed-speakerdeck");

      if (node.attrs.tempId) {
        const component = new ReactRenderer(LoadingCard, {
          editor: this.editor,
        });
        return { dom: component.element };
      }

      const iframe = document.createElement("iframe");
      iframe.setAttribute(
        "src",
        `https://speakerdeck.com/player/${escapeHtml(node.attrs.embedId)}?slide=${escapeHtml(node.attrs.slideIndex || "1")}`,
      );
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("allow", "encrypted-media");

      span.appendChild(iframe);

      return { dom: span };
    };
  },
});
