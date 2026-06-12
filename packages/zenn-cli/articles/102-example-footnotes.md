---
title: '脚注のテスト'
type: 'idea'
topics:
  - footnote
emoji: 📝
published: true
---

脚注ツールチップの動作確認用の記事です。各パターンの `[n]` にホバー・フォーカスして、ツールチップの表示を確認します。

## 基本パターン

通常のテキスト脚注[^text]です。インライン記法^[インライン脚注の内容です]でも書けます。

同じ脚注を 2 回参照[^text]した場合の動作も確認できます。

[^text]: これは通常のテキスト脚注です。

## 装飾・リンク・コードを含む脚注

装飾を含む脚注[^rich]、テキストリンクを含む脚注[^link]、コードを含む脚注[^code]です。

[^rich]: **太字**や*イタリック*、~~打ち消し線~~を含む脚注です。
[^link]: 出典は [Zenn のヘルプ](https://zenn.dev/faq) を参照してください。
[^code]: `console.log('hello')` のようなインラインコードを含みます。

## 埋め込み要素を含む脚注（リンク置換の確認）

リンクカードになる脚注[^card]です。ツールチップ内ではテキストリンクに置換されます。

GitHub 埋め込みの脚注[^github]、mermaid の脚注[^mermaid]、YouTube の脚注[^youtube]です。mermaid と YouTube は「埋め込みコンテンツ」リンク（クリックで脚注へジャンプ）になります。

[^card]: https://zenn.dev/zenn/articles/markdown-guide
[^github]: https://github.com/zenn-dev/zenn-editor/blob/canary/README.md
[^mermaid]: 図の説明です。
    ```mermaid
    graph TD
    A --> B
    ```
[^youtube]: 解説動画です。
    @[youtube](2lAe1cqCOXo)

## 埋め込みのみの脚注

テキストがなく URL だけの脚注[^card-only]です。ツールチップにはリンクのみが表示されます。

[^card-only]: https://zenn.dev/faq

## 数式を含む脚注

KaTeX 数式を含む脚注[^katex]です。

[^katex]: オイラーの等式 $e^{i\pi} + 1 = 0$ は最も美しい数式と言われます。

## 長い内容の脚注（スクロール・折り返しの確認）

とても長い脚注[^long]と、長い URL を含む脚注[^long-url]です。`max-height: 50vh` のスクロールと `overflow-wrap` の折り返しを確認します。

[^long]: 長い脚注の例です。吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。第一毛をもって装飾されべきはずの顔がつるつるしてまるで薬缶だ。その後猫にもだいぶ逢ったがこんな片輪には一度も出会わした事がない。

[^long-url]: https://example.com/very/long/path/that/keeps/going/and/going/with-a-quite-long-slug-segment-1234567890?utm_source=zenn&utm_medium=footnote&utm_campaign=tooltip-overflow-wrap-check

## 画面端での位置確認

このセクションの脚注[^edge]をブラウザの**画面上端ぎりぎり**にスクロールしてからホバーすると、ツールチップが下側に反転表示されることを確認できます。

[^edge]: 画面端での反転表示を確認するための脚注です。

## 参照先が壊れているケース

markdown-it-footnote は未定義の脚注参照を出力しないため、このケースは記事では再現できません（ユニットテストでカバー済み）。
