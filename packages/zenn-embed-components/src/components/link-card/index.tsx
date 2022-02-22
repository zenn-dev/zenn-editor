import { css } from '@emotion/react';
import { EmbedBaseLinkCard } from './EmbedBaseLinkCard';
import { EmbedGithubLinkCard } from './EmbedGithubLinkCard';
import { EmbedLinkCardPlaceholder } from './EmbedLinkCardPlaceholder';
import { LinkData, GithubRepoData } from './types';

export interface EmbedLinkCardProps {
  url?: string;
  isLoading: boolean;
  error?: Error;
  linkData?: LinkData;
  githubRepo?: GithubRepoData;
}

export const EmbedLinkCard = ({
  isLoading,
  linkData,
  githubRepo,
}: EmbedLinkCardProps) => {
  const url = linkData?.url || githubRepo?.url;

  if (isLoading) {
    return (
      <div css={containerStyles}>
        <EmbedLinkCardPlaceholder />
      </div>
    );
  }

  if (url && !/^https?:\/\//i.test(url)) {
    return (
      <div className="message">
        Url must start with `https?://`
        <br />
        {url}
      </div>
    );
  }

  return (
    <div css={containerStyles}>
      {githubRepo ? (
        <EmbedGithubLinkCard {...githubRepo} />
      ) : linkData ? (
        <EmbedBaseLinkCard {...linkData} />
      ) : (
        <div className="message">Require url.</div>
      )}
    </div>
  );
};

const containerStyles = css`
  & {
    border: solid 1px rgba(92, 147, 187, 0.2);
    border-radius: 8px;
    overflow: hidden;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI',
      'Helvetica Neue', Arial, sans-serif;
  }

  .message {
    display: flex;
    align-items: center;
    height: 64px;
    padding: 0.8em 1.2em;
  }
`;

export { LinkData };
