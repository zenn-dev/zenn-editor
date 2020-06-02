import { initTweet, initMathjax } from "./utils/init-embed";

export const initEmbed = (content: string) => {
  if (!content?.length) return;
  if (/twitter-tweet/.test(content)) {
    initTweet();
  }
  if (/\$\$?.+\$/.test(content)) {
    initMathjax();
  }
};
