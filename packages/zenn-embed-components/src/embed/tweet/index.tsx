import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';

const containerClassName = 'embed-tweet-container';
const fallbackLinkClassName = 'embed-tweet-link';
const twitterPattern = /https?:\/\/twitter.com\/(.*?)\/status\/(\d+)[/?]?/;

type CreateTweet = (id: string, ele: HTMLElement, option: any) => Promise<any>;

export interface EmbedTweetCardProps {
  url?: string;
}

export const EmbedTweetCard = ({ url }: EmbedTweetCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const match = url?.match(twitterPattern);
  const tweetId = match?.[2] || null;

  useEffect(() => {
    const createTweet = (window as any).twttr?.widgets?.createTweet as
      | CreateTweet
      | undefined;

    if (!tweetId || !containerRef.current || !createTweet) return;

    const container = containerRef.current;
    const disableConversation = url?.includes('?conversation=none');

    createTweet(tweetId, container, {
      align: 'center',
      ...(disableConversation ? { conversation: 'none' } : {}),
    })
      .then(() => {
        container.querySelector(`.${fallbackLinkClassName}`)?.remove();
      })
      .catch((e) => {
        console.error(e);
      });
  }, [tweetId]);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      css={css`
        .twitter-tweet {
          margin: 0 !important;
        }
      `}
    >
      {url ? (
        <a href={url} className={fallbackLinkClassName} rel="nofollow">
          {url}
        </a>
      ) : (
        <p>Not Found</p>
      )}
    </div>
  );
};
