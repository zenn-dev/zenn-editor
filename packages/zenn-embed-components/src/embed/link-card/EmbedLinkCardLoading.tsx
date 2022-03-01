import { css } from '@emotion/react';
import { containerStyles } from './styles';

export const EmbedLinkCardLoading = () => {
  return (
    <div css={containerStyles}>
      <div
        css={css`
          display: flex;
          justify-content: center;
        `}
      >
        <div
          css={css`
            flex: 1;
            padding: 0.8em 1.2em;
          `}
        >
          <div
            css={css`
              width: 100%;
              height: 32px;
              margin-top: 6px;
              background: #f2f5f7;
            `}
          />
          <div
            css={css`
              width: 100%;
              height: 15px;
              margin-top: 15px;
              background: #f2f5f7;
            `}
          />
        </div>
        <div
          css={css`
            width: 120px;
            height: 120px;
            background: #f2f5f7;
          `}
        />
      </div>
    </div>
  );
};
