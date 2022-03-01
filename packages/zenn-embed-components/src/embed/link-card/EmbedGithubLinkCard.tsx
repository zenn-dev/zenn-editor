import { css } from '@emotion/react';
import { GithubIcon } from '../../components/Icons/GithubIcon';
import { GithubCodeIcon } from '../../components/Icons/GithubCodeIcon';
import { GithubForkIcon } from '../../components/Icons/GithubForkIcon';
import { GithubStarIcon } from '../../components/Icons/GithubStarIcon';
import { GithubRepoData } from './types';

export interface EmbedGithubLinkCardProps extends GithubRepoData {}

export const EmbedGithubLinkCard = ({
  url,
  name,
  owner,
  language,
  forksCount,
  description,
  stargazersCount,
}: EmbedGithubLinkCardProps) => {
  return (
    <a
      href={url}
      rel="noreferrer noopener"
      target="_blank"
      css={styles}
      className="link"
    >
      <div className="main">
        <div className="title">
          <div className="github-icon">
            <GithubIcon />
          </div>

          <h1 className="name">
            {owner}
            <span className="slash">/</span>
            {name}
          </h1>
        </div>

        {description && <div className="description">{description}</div>}

        <div className="meta-container">
          {stargazersCount && (
            <span className="meta">
              <div className="github-icon star">
                <GithubStarIcon />
              </div>
              {stargazersCount}
            </span>
          )}

          {forksCount && (
            <span className="meta">
              <div className="github-icon fork">
                <GithubForkIcon />
              </div>
              {forksCount}
            </span>
          )}

          {language && (
            <span className="meta">
              <div className="github-icon code">
                <GithubCodeIcon />
              </div>
              {language}
            </span>
          )}
        </div>
      </div>
    </a>
  );
};

const styles = css`
  & {
    display: flex;
    align-items: center;
    font-size: 16px;
    height: 120px;
    line-height: 1.4;
    transition: 0.2s;
    color: #7b8288;
    text-decoration: none;
    background: #fff;
    padding: 0 1rem;

    &:hover {
      background: rgba(239, 246, 251, 0.7);
    }
  }
  .title {
    display: flex;
    align-items: center;
  }
  .github-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    margin-right: 6px;
    color: #191919;

    &.star {
      width: 16px;
      height: 16px;
    }
    &.fork {
      width: 15px;
      height: 15px;
    }
    &.code {
      width: 15px;
      height: 15px;
    }
  }
  .name {
    margin: 0;
    word-break: break-all;
    font-size: 1.15em;
    color: #0366d6;
    line-height: 1.2;
  }
  .slash {
    color: #7b8288;
    margin: 0 4px;
    font-weight: normal;
  }

  .description {
    margin-top: 10px;
    font-size: 0.85em;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta-container {
    margin-top: 10px;
    display: flex;
    align-items: center;
  }
  .meta {
    margin-right: 15px;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
  }
  .meta-icon {
    margin-right: 5px;
  }

  @media only screen and (max-width: 480px) {
    .name {
      font-size: 1.05em;
    }
  }
`;
