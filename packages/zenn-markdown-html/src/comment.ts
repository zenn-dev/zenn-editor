import markdownIt from 'markdown-it';
import { defaultPlugin } from './utils/md-default';

const commentMd = markdownIt({
  breaks: true,
  linkify: true,
});
commentMd.use(defaultPlugin).disable(['image', 'table', 'heading']);

// コメント用の変換
export const markdownToCommentHtml = (text: string): string => {
  if (!(text && text.length)) return text;
  return commentMd.render(text);
};
