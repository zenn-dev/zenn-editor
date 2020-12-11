import md from './utils/md';
import { mdLineNumber } from './utils/md-line-number';

export const enablePreview = () => {
  mdLineNumber(md);
};

const markdownToHtml = (text: string): string => {
  if (!(text && text.length)) return text;
  return md.render(text);
};
export default markdownToHtml;
