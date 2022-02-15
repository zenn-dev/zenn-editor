import { EmbedGithubHeader } from './EmbedGithubHeader';
import { getGithubLinkInfo } from './utils';
import { embedGithubStyle, statusMessageStyle } from './styles';

interface EmbedGithubLoadingProps {
  url: string;
}

export const EmbedGithubLoading = ({ url }: EmbedGithubLoadingProps) => {
  return (
    <div>
      <div css={embedGithubStyle}>
        <EmbedGithubHeader url={url} linkInfo={getGithubLinkInfo(url)} />

        <div css={statusMessageStyle}>
          <p>ローディング中...</p>
        </div>
      </div>
    </div>
  );
};
