import md from "./utils/md";
import mdPreview from './utils/md-preview';

const markdownToHtml = (text: string, preview = false): string => {
  if (!(text && text.length)) return text;
  if (preview) {
    return mdPreview.render(text);
  }
  return md.render(text);
};
export default markdownToHtml;
