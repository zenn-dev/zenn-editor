import { css } from '@emotion/react';
import { EmbedTweetLoading } from './EmbedTweetLoading';
import { EmbedTweetNotFound } from './EmbedTweetNotFound';
import { SendWindowSize } from '../../components/SendWindowSize';
import { EmbedComponentProps } from '../types';

export interface EmbedTweetProps extends EmbedComponentProps {}

const View = ({ src, isLoading }: EmbedTweetProps) => {
  let url: URL | null = null;

  try {
    url = new URL(src || '');
  } catch {
    url = null;
  }

  if (isLoading) return <EmbedTweetLoading />;
  if (url?.origin !== 'https://twitter.com') return <EmbedTweetNotFound />;

  return (
    <div
      css={css`
        .twitter-tweet {
          margin: 0 auto !important;
        }
      `}
    >
      <blockquote className="twitter-tweet">
        <a href={url.href} rel="nofollow">
          {src}
        </a>
      </blockquote>
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
