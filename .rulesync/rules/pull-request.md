---
root: false
targets: ['*']
description: 'Pull Requestの作成ルール'
globs: ['**/*']
---

# Pull Requestの作成ルール

- 原則としてDraftで作成すること
- TitleとDescriptionは日本語で作成すること
  - Descriptionの内容は以下にすること
    - 仕様の変更
    - コードの変更
    - その他・備考
- ユーザーをPRのassigneeとして設定すること（ユーザーのGitHubアカウント名は `gh api user --jq .login` で取得できます）
- labelを付与すること
  - @.github/workflows/validate-pr.yml で示されているいずれかのlabel
