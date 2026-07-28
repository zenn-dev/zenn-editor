---
name: release-pr
description: >-
  zenn-editor の最新リリースから次の patch バージョンを決定し、前回のリリースPR以降にマージされたPRを列挙して canary から
  main へのリリースPRを作成する。リリースPR作成の依頼で使用する。
targets:
  - '*'
---
# リリースPRの作成

1. リポジトリの Latest release を取得する。Pre-release は対象外とする。
2. Latest release の patch バージョンを1つ増やし、今回のリリースバージョン `new_version` とする。
3. タイトルが `release {previous_version}` の前回のリリースPRを特定する。
4. 前回のリリースPR以降にマージされたPRのURLを、`https://github.com/zenn-dev/zenn-editor/pull/{pr_number}` の形式ですべて取得する。
5. [PR #561](https://github.com/zenn-dev/zenn-editor/pull/561) を参考に、次の条件でPRを作成する。
   - head: `canary`
   - base: `main`
   - title: `release {new_version}`
   - description: `.github/PULL_REQUEST_TEMPLATE.md` は使用せず、次の内容だけを記載する。

```md
changes:
- {pr_url1}
- {pr_url2}
- ...
```
