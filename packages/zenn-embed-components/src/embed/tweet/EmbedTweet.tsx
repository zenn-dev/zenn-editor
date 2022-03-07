import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { EmbedTweetNotFound } from './EmbedTweetNotFound';
import { SendWindowSize } from '../../components/SendWindowSize';

import { EmbedComponentProps } from '../types';

export interface EmbedTweetProps extends EmbedComponentProps {}

const containerClassName = 'embed-tweet-container';
const fallbackLinkClassName = 'embed-tweet-link';
const twitterPattern = /https?:\/\/twitter.com\/(.*?)\/status\/(\d+)[/?]?/;

const View = ({ src }: EmbedTweetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const match = src?.match(twitterPattern);
  const tweetId = match?.[2] || null;

  useEffect(() => {
    const createTweet = (window as any).twttr?.widgets?.createTweet;

    if (!tweetId || !containerRef.current || !createTweet) return;

    const container = containerRef.current;
    const disableConversation = src?.includes('?conversation=none');

    createTweet(tweetId, container, {
      align: 'center',
      ...(disableConversation ? { conversation: 'none' } : {}),
    })
      .then(() => {
        container.querySelector(`.${fallbackLinkClassName}`)?.remove();
      })
      .catch((e: unknown) => {
        console.error(e);
      });
  }, [tweetId]);

  if (!tweetId) return <EmbedTweetNotFound />;

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      css={css`
        .twitter-tweet {
          margin: 0 auto !important;
        }
      `}
    >
      <a href={src} className={fallbackLinkClassName} rel="nofollow">
        {src}
      </a>
    </div>
  );
};

export const EmbedTweet = (props: EmbedTweetProps) => {
  return (
    <SendWindowSize id={props.id} className="embed-tweet">
      <View {...props} />
    </SendWindowSize>
  );
};
