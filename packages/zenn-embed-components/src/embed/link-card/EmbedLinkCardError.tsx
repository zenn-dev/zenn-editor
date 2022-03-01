import { css } from '@emotion/react';
import { containerStyles } from './styles';

export interface EmbedLinkCardErrorProps {
  url?: string;
  error: Error;
}

export const EmbedLinkCardError = (props: EmbedLinkCardErrorProps) => {
  return (
    <div css={containerStyles}>
      <div
        css={css`
          display: flex;
          align-items: center;
          height: 64px;
          padding: 0.8em 1.2em;
        `}
      >
        Error has occurred
      </div>
    </div>
  );
};
