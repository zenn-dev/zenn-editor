import React from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { usePersistedState } from '../../hooks/use-persisted-state';
import type { TocNode } from 'zenn-model/lib/types';
import styles from './index.module.css';

const TocList: React.FC<{
  toc: TocNode[];
  depth?: number;
  maxDepth: number;
}> = ({ toc, depth = 1, maxDepth }) => {
  return (
    <ol>
      {toc.map((node) => {
        return (
          <li key={node.id}>
            <div className={styles.tocListItem}>
              <a className={styles.tocListItemIdLink} href={`#${node.id}`}>
                {node.text}
              </a>
            </div>
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
  const [isTocFolded, setIsTocFolded] = usePersistedState<boolean>({
    cacheKey: 'fold-toc',
    defaultValue: false,
  });

  return (
    <div className={styles.tocContainer}>
      <div
        className={isTocFolded ? styles.containerClosed : styles.containerOpen}
      >
        <div
          className={styles.titleContainer}
          onClick={() => setIsTocFolded(!isTocFolded)}
        >
          目次のプレビュー
          <MdKeyboardArrowDown
            size={24}
            className={styles.titleContainerToggleIcon}
          />
        </div>

        <div className={styles.toc}>
          <TocList {...tocListProps} />
        </div>
      </div>
    </div>
  );
};
