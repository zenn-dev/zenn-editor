import { css } from '@emotion/react';
import { ErrorContainer } from './types';

interface EmbedMermaidErrorProps {
  errors: ErrorContainer[];
}

export const EmbedMermaidError = ({ errors }: EmbedMermaidErrorProps) => {
  return (
    <div
      css={css`
        font-family: Roboto, Helvetica, Arial, sans-serif;
        font-size: 0.875rem;
        background-color: #ffeff2;
        border: 1px solid pink;
        border-radius: 6px;
        padding: 16px 24px;
        color: #000000a6;
      `}
    >
      <p>mermaidをレンダリングできません。</p>
      <ul>
        {errors.map((e, i) => (
          <li key={i}>{e.message}</li>
        ))}
      </ul>
    </div>
  );
};
