優先度管理用のドキュメント

## paste

- LinkPaste(1000): 貼り付け時にリンクをマークする
- LinkPasteWithSelection(1000): 範囲選択でリンクならマークする
- FileHandler(100): ファイルのペーストは認めない
- DiffCodeLine (100): 差分ブロックの行への外部からのペーストはテキストにして貼り付ける
- FootNoteItem (100): footnoteItemに貼り付けることで分割される現象を防ぐ
- Figure (100): 画像のリンクとマークダウン形式をFigureノードに変換する
- EmbedPasteHandler (2): リンクを埋め込みノードに変換する
- PasteMarkdown (1): 外部からのペーストをマークダウンとしてレンダリングする
