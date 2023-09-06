import { FC, ReactNode } from 'react';
import styled from 'styled-components';

export const TooltipText: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <StyledTooltipText>
      <div className="tooltip-text">{children}</div>
    </StyledTooltipText>
  );
};

const StyledTooltipText = styled.div`
  /* ツールチップのテキスト */
  .tooltip-text {
    opacity: 0; /* はじめは隠しておく */
    visibility: hidden; /* はじめは隠しておく */
    position: absolute; /* 絶対配置 */
    left: 50%; /* 親に対して中央配置 */
    transform: translateX(-50%); /* 親に対して中央配置 */
    bottom: -30px; /* 親要素下からの位置 */
    display: inline-block;
    padding: 5px; /* 余白 */
    white-space: nowrap; /* テキストを折り返さない */
    font-size: 0.8rem; /* フォントサイズ */
    line-height: 1.3; /* 行間 */
    background: #333; /* 背景色 */
    color: #fff; /* 文字色 */
    border-radius: 3px; /* 角丸 */
    transition: 0.3s ease-in; /* アニメーション */
  }

  /* ホバー時にツールチップの非表示を解除 */
  .tooltip:hover .tooltip-text {
    opacity: 1;
    visibility: visible;
  }
`;
