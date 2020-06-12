# Markdown => HTML API
- zenn-markdown-htmlをCloud functionsで動かす


## Deploy
```sh
$ yarn deploy # ビルド後にdeploy-functions.shを実行
```

Note: `gcloud functions deploy`でデプロイするため、ルート（package.jsonと同じ階層）にindex.jsを配置する