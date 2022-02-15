import { css } from '@emotion/react';
import { GithubIcon } from './GithubIcon';
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
    <header
      css={css`
        display: flex;
        background: rgb(246 248 250);
        padding: 8px 16px;
        border-bottom: 1px solid rgb(160, 160, 160, 0.3);
      `}
    >
      <div
        css={css`
          width: 21px;
          height: 21px;
          align-self: center;
          color: rgb(96 105 113);
        `}
      >
        <GithubIcon />
      </div>

      <div
        css={css`
          margin-left: 8px;
        `}
      >
        <p
          css={css`
            line-height: 1.25;
            font-size: 12px;
            color: rgb(87 96 106);
            padding: 0;
            margin: 0;
          `}
        >
          <a
            href={info ? url : '#'}
            target="_blank"
            rel="noreferrer noopener"
            css={css`
              font-weight: 600;
              text-decoration: unset;
              color: rgb(9 105 218);

              &:hover {
                text-decoration: underline;
              }
            `}
          >
            {info ? `${info.owner}/${info.repo}/${info.filePath}` : ''}
          </a>
        </p>

        <p
          css={css`
            line-height: 1.25;
            font-size: 12px;
            color: rgb(87 96 106);
            padding: 0;
            margin: 0;
          `}
        >
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
