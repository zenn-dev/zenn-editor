import { css } from '@emotion/react';
import { useState } from 'react';
import { LinkData } from './types';

export interface EmbedBaseLinkCardProps extends LinkData {}

export const EmbedBaseLinkCard = ({
  url,
  title,
  imageUrl,
  hostname,
  urlOrigin,
  description,
  shouldNofollow,
}: EmbedBaseLinkCardProps) => {
  const [_imageUrl, setImageUrl] = useState(imageUrl);

  const hideImage = () => {
    setImageUrl(undefined);
  };

  return (
    <a
      href={url}
      rel={
        shouldNofollow ? 'nofollow noreferrer noopener' : 'noreferrer noopener'
      }
      target="_blank"
      css={styles}
      className="link"
    >
      <div className="main">
        <h1
          className={
            title && title.length < 10 ? 'title title--large' : 'title'
          }
        >
          {title || url}
        </h1>

        {description && <div className="description">{description}</div>}

        {hostname && (
          <div className="meta">
            <img
              src={`https://www.google.com/s2/favicons?sz=14&domain_url=${
                urlOrigin ?? ''
              }`}
              className="favicon"
              alt={`${hostname} favicon image`}
            />
            {hostname}
          </div>
        )}
      </div>

      {_imageUrl && (
        <div className="thumbnail">
          <img
            src={_imageUrl}
            alt=""
            className="thumbnail-img"
            onError={hideImage}
          />
        </div>
      )}
    </a>
  );
};

const styles = css`
  & {
    display: flex;
    align-items: center;
    font-size: 16.5px;
    height: 120px;
    line-height: 1.5;
    transition: 0.2s;
    color: rgba(0, 0, 0, 0.82);
    text-decoration: none;
    background: #fff;

    &:hover {
      background: rgba(239, 246, 251, 0.7);
    }
  }
  .thumbnail {
    height: 120px;
    max-width: 230px; /* Allow aspect ratio as wide as Twitter Card */
  }
  .main {
    flex: 1;
    padding: 0.8em 1.2em;
    min-width: 0; /* Workaround to enable text overflow ellipsis in flex container. ref: https://codepen.io/distums/pen/VaNjBo */
  }
  .title,
  .description {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .title {
    margin: 0;
    font-size: 1em;
    -webkit-line-clamp: 2;
    max-height: 3.05em;
    user-select: none;
    word-break: break-word;
  }
  .title--large {
    font-size: 1.08em;
  }
  .description {
    margin-top: 0.5em;
    color: #77838c;
    font-size: 0.8em;
    -webkit-line-clamp: 1;
    max-height: 1.55em;
  }

  .meta {
    margin-top: 0.5em;
    font-size: 0.78em;
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .favicon {
    margin-right: 6px;
    flex-shrink: 0;
  }

  .thumbnail-img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    flex-shrink: 0;
  }

  @media only screen and (max-width: 480px) {
    & {
      font-size: 15px;
    }
    .meta {
      margin-top: 0.4em;
    }
    .main {
      padding: 0.7em 1em;
    }
    .thumbnail {
      width: 120px;
    }
  }
`;
