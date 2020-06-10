import commentMd from "./utils/comment-md";

// コメント用の変換
export const markdownToCommentHtml = (text: string): string => {
  if (!(text && text.length)) return text;
  return commentMd.render(text);
};
