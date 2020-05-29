import md from "./utils/md";

const markdownToHtml = (text: string): string => {
  if (!(text && text.length)) return text;
  return md.render(text);
};

export default markdownToHtml;
