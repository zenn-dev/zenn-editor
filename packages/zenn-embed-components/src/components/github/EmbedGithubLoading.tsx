import { EmbedGithubHeader } from './EmbedGithubHeader';
import { embedGithubStyle, statusMessageStyle } from './styles';

interface EmbedGithubLoadingProps {
  url: string;
}

export const EmbedGithubLoading = ({ url }: EmbedGithubLoadingProps) => {
  return (
    <div>
      <div css={embedGithubStyle}>
        <EmbedGithubHeader url={url} />

        <div css={statusMessageStyle}>
          <p>ローディング中...</p>
        </div>
      </div>
    </div>
  );
};
