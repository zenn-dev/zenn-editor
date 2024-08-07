import { describe, test, expect } from "vitest";
import markdownToHtml from "../src/index";
import parse from "node-html-parser";

describe("ソースマップ(data-line属性)のテスト", () => {
  test("Header", () => {
    const html = markdownToHtml(`# Header1
## Header2
### Header3
#### Header4
##### Header5
###### Header6`);
    const h1 = parse(html).querySelector("h1");
    const h2 = parse(html).querySelector("h2");
    const h3 = parse(html).querySelector("h3");
    const h4 = parse(html).querySelector("h4");
    const h5 = parse(html).querySelector("h5");
    const h6 = parse(html).querySelector("h6");
    expect(h1?.getAttribute("data-line")).toEqual("0");
    expect(h1?.classList.contains("code-line")).toBe(true);
    expect(h2?.getAttribute("data-line")).toEqual("1");
    expect(h2?.classList.contains("code-line")).toBe(true);
    expect(h3?.getAttribute("data-line")).toEqual("2");
    expect(h3?.classList.contains("code-line")).toBe(true);
    expect(h4?.getAttribute("data-line")).toEqual("3");
    expect(h4?.classList.contains("code-line")).toBe(true);
    expect(h5?.getAttribute("data-line")).toEqual("4");
    expect(h5?.classList.contains("code-line")).toBe(true);
    expect(h6?.getAttribute("data-line")).toEqual("5");
    expect(h6?.classList.contains("code-line")).toBe(true);
  });

  test("Paragraph", () => {
    const html = markdownToHtml(`Paragraph1\n\nhttps://example.com`);
    const p = parse(html).querySelectorAll("p");
    expect(p?.[0].getAttribute("data-line")).toEqual("0");
    expect(p?.[0].classList.contains("code-line")).toBe(true);
    expect(p?.[1].getAttribute("data-line")).toEqual("2");
    expect(p?.[1].classList.contains("code-line")).toBe(true);
  });

  test("List(unordered)", () => {
    const html = markdownToHtml(`- item1\n- item2`);
    const ul = parse(html).querySelector("ul");
    const li = parse(html).querySelectorAll("li");
    expect(ul?.getAttribute("data-line")).toEqual("0");
    expect(ul?.classList.contains("code-line")).toBe(true);
    expect(li?.[0].getAttribute("data-line")).toEqual("0");
    expect(li?.[0].classList.contains("code-line")).toBe(true);
    expect(li?.[1].getAttribute("data-line")).toEqual("1");
    expect(li?.[1].classList.contains("code-line")).toBe(true);
  });

  test("List(ordered)", () => {
    const html = markdownToHtml(`1. item1\n2. item2`);
    const ol = parse(html).querySelector("ol");
    const li = parse(html).querySelectorAll("li");
    expect(ol?.getAttribute("data-line")).toEqual("0");
    expect(ol?.classList.contains("code-line")).toBe(true);
    expect(li?.[0].getAttribute("data-line")).toEqual("0");
    expect(li?.[0].classList.contains("code-line")).toBe(true);
    expect(li?.[1].getAttribute("data-line")).toEqual("1");
    expect(li?.[1].classList.contains("code-line")).toBe(true);
  });

  test("Table", () => {
    const html = markdownToHtml(`| a | b |\n| --- | --- |\n| c | d |`);
    const table = parse(html).querySelector("table");
    const thead = parse(html).querySelector("thead");
    const tbody = parse(html).querySelector("tbody");
    const tr = parse(html).querySelectorAll("tr");
    expect(table?.getAttribute("data-line")).toEqual("0");
    expect(table?.classList.contains("code-line")).toBe(true);
    expect(thead?.getAttribute("data-line")).toEqual("0");
    expect(thead?.classList.contains("code-line")).toBe(true);
    expect(tbody?.getAttribute("data-line")).toEqual("2");
    expect(tbody?.classList.contains("code-line")).toBe(true);
    expect(tr?.[0].getAttribute("data-line")).toEqual("0");
    expect(tr?.[0].classList.contains("code-line")).toBe(true);
    expect(tr?.[1].getAttribute("data-line")).toEqual("2");
    expect(tr?.[1].classList.contains("code-line")).toBe(true);
  });

  test("Code Block", () => {
    const html = markdownToHtml("```\ncode\n```");
    // <code />が取得できないので<pre />で取得する
    const innerHTML: any = parse(html).querySelector("pre")?.innerHTML;
    const code = parse(innerHTML).querySelector("code");
    expect(code?.getAttribute("data-line")).toEqual("0"); // フェンス開始時の行番号
    expect(code?.classList.contains("code-line")).toBe(true);
  });

  test("Katex", () => {
    const html = markdownToHtml(`$$\na\n$$`);
    const katex = parse(html).querySelector("section");
    expect(katex?.getAttribute("data-line")).toEqual("0");
    expect(katex?.classList.contains("code-line")).toBe(true);
  });

  test("Blockquote", () => {
    const html = markdownToHtml("> quote");
    const blockquote = parse(html).querySelector("blockquote");
    expect(blockquote?.getAttribute("data-line")).toEqual("0");
    expect(blockquote?.classList.contains("code-line")).toBe(true);
  });

  test("Horizontal Rule", () => {
    const html = markdownToHtml(`---`);
    const hr = parse(html).querySelector("hr");
    expect(hr?.getAttribute("data-line")).toEqual("0");
    expect(hr?.classList.contains("code-line")).toBe(true);
  });

  test("Alert", () => {
    const html = markdownToHtml(":::message\nhello\n:::");
    const p = parse(html).querySelector("p");
    expect(p?.getAttribute("data-line")).toEqual("1");
    expect(p?.classList.contains("code-line")).toBe(true);
  });

  test("Details/Summary", () => {
    const html = markdownToHtml(`:::details タイトル\nhello\n:::`);
    const p = parse(html).querySelector("p");
    expect(p?.getAttribute("data-line")).toEqual("1");
    expect(p?.classList.contains("code-line")).toBe(true);
  });
});
