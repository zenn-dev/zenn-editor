import { cssText } from './github-css';
import { EmbedGithubHeader } from './github-header';

interface EmbedGithubLoadingProps {
  url: string;
}

export const EmbedGithubLoading = ({ url }: EmbedGithubLoadingProps) => {
  return (
    <div className="embed-github__container">
      <style>{cssText}</style>

      <div className="embedded-github">
        <EmbedGithubHeader url={url} />

        <div className="message">
          <p>ローディング中...</p>
        </div>
      </div>
    </div>
  );
};
