import { Button, IconButton } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopyOutlined';
import React from 'react';
import styled from 'styled-components';

export type TocNode = {
  text: string;
  id: string;
  children: TocNode[];
};

const TocList: React.FC<{
  toc: TocNode[];
  depth?: number;
  maxDepth: number;
}> = ({ toc, depth = 1, maxDepth }) => {
  const handleCopyHeaderId = (id: string) => {
    navigator.clipboard.writeText(id);
  };
  return (
    <ol className={`toc__ol-depth-${depth}`}>
      {toc.map((node) => {
        return (
          <li key={node.id}>
            <a href={`#${node.id}`}>{node.text}</a>
            <IconButton
              className="toc__copy-button"
              size="small"
              disableFocusRipple={true}
              disableRipple={true}
              disableTouchRipple={true}
              color="inherit"
              onClick={() => handleCopyHeaderId(node.id)}
            >
              <img
                src="/static-images/copy-icon.svg"
                width={18}
                height={18}
                alt=""
                className="toc__copy-icon"
              />
            </IconButton>
            {depth < maxDepth && node.children.length > 0 && (
              <TocList
                toc={node.children}
                maxDepth={maxDepth}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

type TocProps = {
  toc: TocNode[];
  maxDepth: number;
};
/**
 * @param toc TocNodeの配列
 * @param maxDepth 最大何層目までの見出しを目次に含めるか
 */
export const Toc: React.FC<TocProps> = ({ ...tocListProps }) => {
  return (
    <BodyStyledToc className="tocContainer">
      <div className="toc">
        <TocList {...tocListProps} />
      </div>
    </BodyStyledToc>
  );
};

const BodyStyledToc = styled.div`
  border: solid 1px var(--c-gray-border);
  overflow: hidden;
  margin-bottom: 1.8rem;
  line-height: 1.5;
  border-radius: 7px;
  // box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  .toc {
    padding: 0.7rem 1.1rem;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--c-gray);
    a {
      color: inherit;
      &:hover {
        color: var(--c-body);
        text-decoration: underline;
      }
    }
    li {
      padding: 0.35em 0;
      list-style: disc;
      margin-left: 1.3rem;
      li {
        list-style: none;
        margin-left: 0.1em;
        padding: 0.4em 0 0.1em 0.9em;
        position: relative;

        &:before {
          position: absolute;
          content: '-';
          left: 0;
          flex-shrink: 0;
          margin-right: 0.5em;
          color: var(--c-gray-lighter);
        }
      }
    }
  }
  .toc__copy-button {
    '&:hover': {
      background-color: '#FFF';
    }
  }
`;
