---
description: 'リリース用のプルリクエストを作成します'
targets:
  - '*'
---

1. 最新のリポジトリのリリースバージョンを取得します。patchバージョンを+1して今回リリースするバージョンとし、new_versionと呼称します。
2. 前回のリリースPRより後にマージされたPRのURL（`https://github.com/zenn-dev/zenn-editor/pull/{pr_number}`）をすべて取得します。
3. 以下の内容でPRを作成します。参考: https://github.com/zenn-dev/zenn-editor/pull/561
    - title: `release {new_version}`
    - description:
        ```md
        changes:
        - {pr_url1}
        - {pr_url2}
        - ...
        ```
