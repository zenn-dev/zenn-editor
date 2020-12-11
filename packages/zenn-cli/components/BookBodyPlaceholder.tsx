import React from 'react';

export const BookBodyPlaceholder: React.FC = () => (
  <>
    <h1>📝 チャプターを作成する</h1>
    <p>
      1つめのチャプターを作成しましょう。チャプターは
      <code>チャプター番号.md</code>
      という形式でファイルを作成します。チャプター1は
      <code>1.md</code>、チャプター2は
      <code>2.md</code>…のようになります。
      <br />
      <br />
      <a
        href="https://zenn.dev/zenn/articles/zenn-cli-guide#cliで本（book）を管理する"
        target="_blank"
        rel="noreferrer noopener"
      >
        本の作成について詳しく知る→
      </a>
    </p>
  </>
);
