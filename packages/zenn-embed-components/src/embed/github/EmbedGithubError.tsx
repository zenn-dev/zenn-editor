import { EmbedGithubHeader } from './EmbedGithubHeader';
import { getGithubLinkInfo } from './utils';
import { embedGithubStyle, statusMessageStyle } from './styles';

interface EmbedGithubErrorProps {
  url?: string;
  error: Error;
}

export const EmbedGithubError = ({ url }: EmbedGithubErrorProps) => {
  return (
    <div css={embedGithubStyle}>
      <EmbedGithubHeader url={url} linkInfo={getGithubLinkInfo(url || '')} />

      <div css={statusMessageStyle}>
        <p>Githubの読み込みに失敗しました</p>
      </div>
    </div>
  );
};
