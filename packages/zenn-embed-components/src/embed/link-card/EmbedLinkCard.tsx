import { EmbedBaseLinkCard } from './EmbedBaseLinkCard';
import { EmbedGithubLinkCard } from './EmbedGithubLinkCard';
import { EmbedLinkCardLoading } from './EmbedLinkCardLoading';
import { EmbedLinkCardNotFound } from './EmbedLinkCardNotFound';
import { SendWindowSize } from '../../components/SendWindowSize';
import { LinkData, GithubRepoData } from './types';
import { containerStyles } from './styles';
import { EmbedLinkCardError } from './EmbedLinkCardError';

export interface EmbedLinkCardProps {
  url?: string;
  error?: Error;
  linkData?: LinkData;
  githubRepo?: GithubRepoData;
}

const View = ({ url, error, linkData, githubRepo }: EmbedLinkCardProps) => {
  if (error) return <EmbedLinkCardError url={url} error={error} />;
  if (!url) return <EmbedLinkCardNotFound />;
  if (!linkData && !githubRepo) return <EmbedLinkCardLoading />;

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

export const EmbedLinkCard = (props: EmbedLinkCardProps) => {
  return (
    <SendWindowSize url={props.url || ''} className="embed-link-card">
      <View {...props} />
    </SendWindowSize>
  );
};
