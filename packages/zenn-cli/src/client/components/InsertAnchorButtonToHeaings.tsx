import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
};

/**
 * Markdownプレビュー内のコードブロックにコピーボタンを追加するコンポーネント
 */
export const InsertAnchorButtonToHeadings: React.FC<Props> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 見出しの要素を取得する
    const containerElem = containerRef.current;
    if (!containerElem) return;
    const headerAnchorLinks = containerElem.querySelectorAll(
      '.header-anchor-link'
    );

    // 見出しの隣にアンカーボタン 🔗 を表示する
    headerAnchorLinks.forEach((headerAnchorLink) => {
      const anchorButton = document.createElement('button');
      anchorButton.setAttribute('class', 'anchorButton');

      const parent = headerAnchorLink.parentElement;
      if (!parent) return;

      parent.setAttribute(
        'class',
        clsx(parent.getAttribute('class'), 'heading')
      );

      // 見出しの隣にボタンを追加する
      parent.insertBefore(anchorButton, headerAnchorLink);

      // tooltip のオプションを設定
      anchorButton.setAttribute('data-tooltip-position', 'top-left');
      anchorButton.setAttribute(
        'aria-label',
        '見出しのアンカーリンクをクリップボードにコピー'
      );

      // ボタンをクリックしたら見出しのアンカーリンクをクリップボードにコピーする
      anchorButton.addEventListener('click', async () => {
        // アンカーリンクの href を取得し、クリップボードにコピーする
        const text = headerAnchorLink.getAttribute('href') ?? '';
        await navigator.clipboard.writeText(text);

        // この時にツールチップを表示する
        anchorButton.setAttribute('role', 'tooltip');
        anchorButton.setAttribute(
          'aria-label',
          'アンカーリンクをコピーしました！'
        );

        // 3秒後に非表示にする
        setTimeout(() => {
          anchorButton.removeAttribute('role');
          anchorButton.setAttribute(
            'aria-label',
            '見出しのアンカーリンクをクリップボードにコピー'
          );
        }, 3000);
      });
    });

    return () => {
      // クリーンアップ処理でボタンを削除と、見出しの追加クラスを削除する
      headerAnchorLinks.forEach((headerAnchorLink) => {
        const parent = headerAnchorLink.parentElement;
        if (!parent) return;

        // 見出しの追加クラスを削除する
        const parentClass = parent.getAttribute('class');
        if (parentClass) {
          parent.setAttribute('class', parentClass.replace('heading', ''));
        }

        // ボタンを削除する
        const anchorButton = parent.querySelector('.anchorButton');
        if (anchorButton) {
          parent.removeChild(anchorButton);
        }
      });
    };
  }, []);

  return (
    <StyledInsertAnchorButtonToHeadings>
      <div ref={containerRef}>{children}</div>
    </StyledInsertAnchorButtonToHeadings>
  );
};

const StyledInsertAnchorButtonToHeadings = styled.div`
  .heading {
    position: relative;
  }

  .anchorButton {
    position: absolute;
    top: 0.23em;
    left: -25px;
    display: block;
    width: 24px;
    height: 1em;
    padding-right: 5px;

    background: url('https://zenn.dev/permanent/link-gray.svg') no-repeat center;
    background-size: 20px 20px;
    opacity: 0;

    // hover 時にボタンを表示する
    &:hover {
      opacity: 1;
    }
  }
`;
