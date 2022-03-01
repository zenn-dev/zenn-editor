import { EmbedBaseLinkCard } from './EmbedBaseLinkCard';
import { EmbedLinkCardError } from './EmbedLinkCardError';
import { EmbedGithubLinkCard } from './EmbedGithubLinkCard';
import { EmbedLinkCardLoading } from './EmbedLinkCardLoading';
import { EmbedLinkCardNotFound } from './EmbedLinkCardNotFound';
import { SendWindowSize } from '../../components/SendWindowSize';
import { containerStyles } from './styles';
import { EmbedComponentProps } from '../types';
import { LinkData, GithubRepoData } from './types';

export interface EmbedLinkCardProps extends EmbedComponentProps {
  linkData?: LinkData;
  githubRepo?: GithubRepoData;
}

const View = ({
  src,
  error,
  isLoading,
  linkData,
  githubRepo,
}: EmbedLinkCardProps) => {
  if (error) return <EmbedLinkCardError url={src} error={error} />;
  if (isLoading) return <EmbedLinkCardLoading />;
  if (!linkData && !githubRepo) return <EmbedLinkCardNotFound />;

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
    <SendWindowSize id={props.id} className="embed-link-card">
      <View {...props} />
    </SendWindowSize>
  );
};
