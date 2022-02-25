import { css } from '@emotion/react';
import { containerStyles } from './styles';

export const EmbedLinkCardNotFound = () => {
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
        Require URL
      </div>
    </div>
  );
};
