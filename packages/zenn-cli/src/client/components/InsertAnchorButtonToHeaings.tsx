import { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
};

/**
 * Markdownプレビュー内のコードブロックにコピーボタンを追加するコンポーネント
 */
export const InsertAnchorButtonToHeadings: React.FC<Props> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // コードブロックの要素を取得する
    const containerElem = containerRef.current;
    if (!containerElem) return;
    const headerAnchorLinks = containerElem.querySelectorAll(
      '.header-anchor-link'
    );
    console.log(headerAnchorLinks);
    headerAnchorLinks.forEach((headerAnchorLink) => {
      const anchorButton = document.createElement('button');
      const parent = headerAnchorLink.parentElement;
      if (!parent) return;

      parent.setAttribute('style', 'position: relative;');
      anchorButton.setAttribute(
        'style',
        `
        position: absolute;
        top: 0.23em;
        left: -25px;
        display: block;
        width: 24px;
        height: 1em;
        padding-right: 5px;

        background: url('https://zenn.dev/permanent/link-gray.svg') no-repeat
          center;
        background-size: 20px 20px;
        opacity: 1;
      `
      );
      parent.insertBefore(anchorButton, headerAnchorLink);

      // tooltip のオプションを設定
      anchorButton.setAttribute('data-tooltip-position', 'top-left');
      anchorButton.setAttribute(
        'aria-label',
        '見出しのアンカーリンクをクリップボードにコピー'
      );

      // ボタンをクリックしたら見出しのアンカーリンクをクリップボードにコピーする
      // 親要素が React で管理されてないので、アンマウント時の removeEventListener はあまり意味がないので実装しない
      anchorButton.addEventListener('click', async () => {
        const text = 'test';

        await navigator.clipboard.writeText(text.replace(/\n$/, ''));

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
  }, []);

  return <div ref={containerRef}>{children}</div>;
};
