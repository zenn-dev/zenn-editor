import { katexClassName } from './constants';

function checkIsKatex(text: string) {
  return text.indexOf(katexClassName) !== -1; // fastest way...?
}

export function processHtml(html: string) {
  if (!html || html.length < 5) return html;

  const isKatex = checkIsKatex(html);
  /**
   * katex記法が存在するときのみstylesheetを読みこむ
   */
  if (isKatex) {
    html = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css"/>${html}`;
  }
  return html;
}
