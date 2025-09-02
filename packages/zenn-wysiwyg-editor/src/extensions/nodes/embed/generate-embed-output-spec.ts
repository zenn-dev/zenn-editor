import type { DOMOutputSpec } from "@tiptap/pm/model";
import type { EmbedType } from "zenn-markdown-html/lib/embed";
import { EMBED_ORIGIN } from "../../../lib/constants";
import { sanitizeEmbedToken } from "../../../lib/embed";
import { escapeHtml } from "../../../lib/escape";
import {
  extractDocswellEmbedUrl,
  extractYoutubeVideoParameters,
} from "../../../lib/url";

export function generateEmbedOutputSpec(
  type: EmbedType,
  url: string,
): DOMOutputSpec {
  if (
    type === "card" ||
    type === "github" ||
    type === "gist" ||
    type === "tweet"
  ) {
    return generateEmbedServerOutputSpec(type, url);
  } else if (type === "stackblitz") {
    return generateEmbedStackblitzOutputSpec(url);
  } else if (type === "jsfiddle") {
    return generateEmbedJsfiddleOutputSpec(url);
  } else if (type === "codesandbox") {
    return generateEmbedCodesandboxOutputSpec(url);
  } else if (type === "codepen") {
    return generateEmbedCodepenOutputSpec(url);
  } else if (type === "youtube") {
    return generateEmbedYoutubeOutputSpec(url);
  } else if (type === "figma") {
    return generateEmbedFigmaOutputSpec(url);
  } else if (type === "docswell") {
    return generateEmbedDocswellOutputSpec(url);
  }

  throw new Error(`Unsupported embed type: ${type}`);
}

function generateEmbedServerOutputSpec(
  type: string,
  url: string,
): DOMOutputSpec {
  const id = `zenn-embedded__${Math.random().toString(16).slice(2)}`;
  const iframeSrc = `${EMBED_ORIGIN}/${type}#${id}`;
  const encodedSrc = encodeURIComponent(url || "");

  return [
    "span",
    {
      class: `embed-block zenn-embedded zenn-embedded-${type}`,
    },
    [
      "iframe",
      {
        id: id,
        src: iframeSrc,
        frameborder: "0",
        scrolling: "no",
        loading: "lazy",
        "data-content": encodedSrc,
      },
    ],
  ];
}

function generateEmbedStackblitzOutputSpec(url: string): DOMOutputSpec {
  return [
    "span",
    {
      class: "embed-block embed-stackblitz",
    },
    [
      "iframe",
      {
        src: sanitizeEmbedToken(url),
        frameborder: "no",
        scrolling: "no",
        loading: "lazy",
      },
    ],
  ];
}

function generateEmbedJsfiddleOutputSpec(url: string): DOMOutputSpec {
  if (!url.includes("embed")) {
    url = url.endsWith("/") ? `${url}embedded/` : `${url}/embedded/`;
  }

  return [
    "span",
    {
      class: "embed-block embed-jsfiddle",
    },
    [
      "iframe",
      {
        src: sanitizeEmbedToken(url),
        frameborder: "no",
        scrolling: "no",
        loading: "lazy",
      },
    ],
  ];
}

function generateEmbedCodesandboxOutputSpec(url: string): DOMOutputSpec {
  return [
    "span",
    {
      class: "embed-block embed-codesandbox",
    },
    [
      "iframe",
      {
        src: sanitizeEmbedToken(url),
        frameborder: "no",
        scrolling: "no",
        loading: "lazy",
        style: "width:100%;height:500px;border:none;overflow:hidden;",
        allow:
          "accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking",
        sandbox:
          "allow-modals allow-forms allow-popups allow-scripts allow-same-origin",
      },
    ],
  ];
}

function generateEmbedCodepenOutputSpec(url: string): DOMOutputSpec {
  const embedUrl = new URL(url.replace("/pen/", "/embed/"));
  embedUrl.searchParams.set("embed-version", "2");

  return [
    "span",
    {
      class: "embed-block embed-codepen",
    },
    [
      "iframe",
      {
        src: sanitizeEmbedToken(embedUrl.toString()),
        frameborder: "no",
        scrolling: "no",
        loading: "lazy",
      },
    ],
  ];
}

function generateEmbedYoutubeOutputSpec(url: string): DOMOutputSpec {
  const params = extractYoutubeVideoParameters(url);
  if (!params) throw new Error(`Invalid YouTube URL: ${url}`);

  const escapedVideoId = escapeHtml(params.videoId);
  const time = Math.min(Number(params.start || 0), 48 * 60 * 60); // 48時間以内
  const startQuery = time ? `?start=${time}` : "";

  return [
    "span",
    {
      class: "embed-block embed-youtube",
    },
    [
      "iframe",
      {
        src: `https://www.youtube-nocookie.com/embed/${escapedVideoId}${startQuery}`,
        allow:
          "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        loading: "lazy",
      },
    ],
  ];
}

function generateEmbedFigmaOutputSpec(url: string): DOMOutputSpec {
  return [
    "span",
    {
      class: "embed-block embed-figma",
    },
    [
      "iframe",
      {
        src: url, // node.attrs.urlの段階でembed用に変換済み
        frameborder: "no",
        scrolling: "no",
        loading: "lazy",
        style: "aspect-ratio: 16/9",
        width: "100%",
        allowfullscreen: true,
      },
    ],
  ];
}

function generateEmbedDocswellOutputSpec(url: string): DOMOutputSpec {
  const slideUrl = extractDocswellEmbedUrl(url);
  if (!slideUrl) {
    throw new Error(`Invalid Docswell URL: ${url}`);
  }

  return [
    "span",
    {
      class: "embed-block embed-docswell",
    },
    [
      "iframe",
      {
        src: slideUrl,
        allowfullscreen: true,
        class: "docswell-iframe",
        width: "100%",
        style:
          "border: 1px solid #ccc; display: block; margin: 0px auto; padding: 0px; aspect-ratio: 16/9",
      },
    ],
  ];
}
