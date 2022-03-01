import { css } from '@emotion/react';

export interface EmbedGistLoadingProps {
  url?: string;
}

export const EmbedGistLoading = (props: EmbedGistLoadingProps) => {
  return (
    <div
      className="embed-gist"
      css={css`
        text-align: center;
        margin: 1.5rem 0;
        color: gray;
        font-size: 0.9rem;
      `}
    >
      <p>Loading...</p>
    </div>
  );
};
