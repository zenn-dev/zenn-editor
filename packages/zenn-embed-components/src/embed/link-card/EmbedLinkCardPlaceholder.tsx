import { css } from '@emotion/react';

export const EmbedLinkCardPlaceholder = () => {
  return (
    <div className="placeholder" css={styles}>
      <div className="placeholder-main">
        <div className="placeholder-title" />
        <div className="placeholder-description" />
      </div>
      <div className="placeholder-thumbnail" />
    </div>
  );
};

const styles = css`
  & {
    display: flex;
    justify-content: center;
  }
  .placeholder-main {
    flex: 1;
    padding: 0.8em 1.2em;
  }
  .placeholder-thumbnail {
    width: 120px;
    height: 120px;
  }
  .placeholder-title,
  .placeholder-description,
  .placeholder-thumbnail {
    background: #f2f5f7;
  }
  .placeholder-title {
    width: 100%;
    margin-top: 6px;
    height: 32px;
  }
  .placeholder-description {
    margin-top: 15px;
    width: 100%;
    height: 15px;
  }
`;
