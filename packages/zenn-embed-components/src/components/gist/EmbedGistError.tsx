import { css } from '@emotion/react';

export interface EmbedGistErrorProps {
  url?: string;
  error: Error;
}

export const EmbedGistError = ({ url }: EmbedGistErrorProps) => {
  return (
    <div className="embed-gist">
      <div
        css={css`
          text-align: center;
          margin: 1.5rem 0;
          color: gray;
          font-size: 0.9rem;
        `}
      >
        Gistの読み込みに失敗しました
        <br />
        {url}
      </div>
    </div>
  );
};
