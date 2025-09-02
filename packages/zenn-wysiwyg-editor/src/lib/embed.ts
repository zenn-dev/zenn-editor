import {
  isCodepenUrl,
  isCodesandboxUrl,
  isDocswellUrl,
  isFigmaUrl,
  isGistUrl,
  isGithubUrl,
  isJsfiddleUrl,
  isSpeakerDeckUrl,
  isStackblitzUrl,
  isTweetUrl,
  isValidHttpUrl,
  isYoutubeUrl,
} from "../lib/url";
import type { EmbedType } from "../types";

/** 渡された文字列をサニタイズする */
export function sanitizeEmbedToken(str: string): string {
  return str.replace(/"/g, "%22");
}

export function getEmbedTypeFromElement(
  element: HTMLElement, // span要素であることを想定
): EmbedType | null {
  if (element.classList.contains("zenn-embedded-card")) {
    return "card";
  } else if (element.classList.contains("zenn-embedded-github")) {
    return "github";
  } else if (element.classList.contains("zenn-embedded-tweet")) {
    return "tweet";
  } else if (element.classList.contains("zenn-embedded-gist")) {
    return "gist";
  } else if (element.classList.contains("embed-stackblitz")) {
    return "stackblitz";
  } else if (element.classList.contains("embed-codesandbox")) {
    return "codesandbox";
  } else if (element.classList.contains("embed-codepen")) {
    return "codepen";
  } else if (element.classList.contains("embed-jsfiddle")) {
    return "jsfiddle";
  } else if (element.classList.contains("embed-youtube")) {
    return "youtube";
  } else if (element.classList.contains("embed-figma")) {
    return "figma";
  } else if (element.classList.contains("embed-docswell")) {
    return "docswell";
  }

  return null;
}

export function getEmbedTypeFromUrl(url: string): EmbedType | null {
  if (isTweetUrl(url)) {
    return "tweet";
  } else if (isGithubUrl(url)) {
    return "github";
  } else if (isGistUrl(url)) {
    return "gist";
  } else if (isCodepenUrl(url)) {
    return "codepen";
  } else if (isJsfiddleUrl(url)) {
    return "jsfiddle";
  } else if (isCodesandboxUrl(url)) {
    return "codesandbox";
  } else if (isStackblitzUrl(url)) {
    return "stackblitz";
  } else if (isYoutubeUrl(url)) {
    return "youtube";
  } else if (isSpeakerDeckUrl(url)) {
    return "speakerdeck";
  } else if (isFigmaUrl(url)) {
    return "figma";
  } else if (isDocswellUrl(url)) {
    return "docswell";
  } else if (isValidHttpUrl(url)) {
    // 一番最後にする
    return "card";
  }

  return null;
}
