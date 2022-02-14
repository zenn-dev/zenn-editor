import { GithubIcon } from './github-icon';
import { formatBranchName, GithubLinkInfo } from './utils';

interface EmbedGithubHeaderProps {
  url: string;
  linkInfo?: GithubLinkInfo;
}

/**
 * Githubの埋め込み要素のヘッダー
 */
export const EmbedGithubHeader = ({
  url,
  linkInfo: info,
}: EmbedGithubHeaderProps) => {
  return (
    <header className="header">
      <div className="gh-icon">
        <GithubIcon />
      </div>

      <div className="container">
        <p className="label">
          <a href={info ? url : '#'} target="_blank" rel="noreferrer noopener">
            {info ? `${info.owner}/${info.repo}/${info.filePath}` : ''}
          </a>
        </p>

        <p className="label">
          {
            // prettier-ignore
            info
              ? `Lines ${info.startLine} to ${info.endLine || 1} in ${formatBranchName(info?.branch || '')}`
              : ''
          }
        </p>
      </div>
    </header>
  );
};
