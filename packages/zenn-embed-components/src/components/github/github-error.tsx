import { cssText } from './github-css';
import { EmbedGithubHeader } from './github-header';
import { getGithubLinkInfo } from './utils';

interface EmbedGithubErrorProps {
  url: string;
  error: Error;
}

export const EmbedGithubError = ({ url }: EmbedGithubErrorProps) => {
  return (
    <div className="embed-github__container">
      <style>{cssText}</style>

      <div className="embedded-github">
        <EmbedGithubHeader url={url} linkInfo={getGithubLinkInfo(url)} />

        <div className="message">
          <p>Githubの読み込みに失敗しました</p>
        </div>
      </div>
    </div>
  );
};
