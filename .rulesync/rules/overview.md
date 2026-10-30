---
root: true
targets:
  - '*'
description: ''
globs:
  - '**/*'
---
# Zenn Editor - Architecture Overview

## Public Repository Notice

This is a public repository. Never include the contents of private repositories or any confidential/internal information (e.g. internal URLs, private repo code or file paths, unreleased business plans, customer information) in PR titles/descriptions, review comments, issues, commit messages, source code comments, or any other content pushed or posted to this repository. Describe changes only in terms of what is visible in this repository or other publicly available sources.

## Repository

A pnpm + Turbo monorepo. All packages share one version managed by Lerna-lite (`lerna.json`); `publish.yml` publishes regular releases from `main` and prereleases from `canary`. The default branch is `canary`.

| Package | Role | Build output |
| --- | --- | --- |
| `zenn-cli` | CLI and local preview server (Express + Vite SPA) | `dist/server/zenn.js` (rspack), `dist/client/` (Vite) |
| `zenn-markdown-html` | Zenn-flavored Markdown → HTML | `dist/` (ESM via tsup, types via tsc). Subpath export `zenn-markdown-html/utils` |
| `zenn-model` | Types and validation of articles, books, chapters | `lib/` (CJS via esbuild, types via tsc) |
| `zenn-content-css` | Styles for rendered content (`.znc` root class) | `lib/index.css` (sass) |
| `zenn-embed-elements` | Web Components for the browser (`embed-katex`, footnote tooltips) | `lib/` (tsc) |

`zenn-cli` depends on `zenn-markdown-html` at runtime. `zenn-model`, `zenn-content-css`, and `zenn-embed-elements` are devDependencies bundled into the client by Vite.

## zenn-cli

- Entry: `src/server/zenn.ts` → `src/server/commands/index.ts`. Commands: `preview` (default), `init`, `new:article`, `new:book`, `list:articles`, `list:books`, `scrap` and `image` (Scrap and image operations via the Zenn Public API), `--help`, `--version`. `new:*` takes options such as `--slug`/`--title` (no interactive prompts); `list:*` supports `--format tsv/json`.
- Content layout: articles are `articles/<slug>.md`; books are `books/<slug>/` with `config.yaml` (or `config.yml`), a cover image, and chapter `.md` files. Chapter order comes from `chapters` in the config, otherwise from an `N.` filename prefix (no prefix → `position: null`).
- Preview server: `src/server/app.ts` (routes) and `src/server/lib/server.ts` (HTTP + WebSocket). Port 8000 by default, incremented when busy. chokidar sends a refresh message only on `change` events (not on file add/delete).
- API routes: `/api/articles`, `/api/articles/:slug`, `/api/books`, `/api/books/:slug`, `/api/books/:book_slug/chapters`, `/api/books/:book_slug/chapters/:chapter_filename`, `/api/manual/:slug`, `/api/cli-version`, `/api/local-info`, and `/images/*splat` (served from `cwd/images`; paths containing `..` are rejected).
- Content is read from disk and converted on every request (no cache): `parseFrontMatter` (js-yaml `JSON_SCHEMA`) → `markdownToHtml` with `getMarkdownOptions()` (`src/server/lib/markdown-options.ts`) → `completeHtml` (inserts errors for non-absolute image paths, unsupported image extensions, missing images, or images over 3MB) → `parseToc`. A book's `config.yaml` (or `config.yml`) is parsed with the default js-yaml schema.
- Environment variables:
  - Variables in `.env` are inlined at build time by rspack's DefinePlugin (e.g. `VITE_EMBED_SERVER_ORIGIN`).
  - Variables that users set at runtime must be listed in `RUNTIME_ONLY_ENV_KEYS` in `rspack.server.js` and read via `runtimeEnv()` (`src/server/lib/runtime-env.ts`). Never put them in `.env` / `.env.example`.

## zenn-markdown-html

- `markdownToHtml(text, options)` is **async**: markdown-it renders code blocks as placeholders, Shiki highlights them asynchronously (`src/utils/md-renderer-fence.ts`, `src/utils/highlight.ts`), then the result is sanitized with `sanitize-html` (`src/sanitizer.ts`; disallowed tags are discarded). `markdownToSimpleHtml` is also exported.
- The code is meant to run in both Node.js and the browser. Do not use Node-only modules or `DOMParser`.
- Plugins are registered in `src/index.ts` (order matters). `mdCustomBlock` handles the `@[type](...)` embed syntax; `:::message` / `:::details` use markdown-it-container; heading anchors are added to h1–h4.
- `MarkdownOptions` (`src/types.ts`): `embedOrigin`, `customEmbed`, `htmlEmbed` (opt-in, default off; renders ` ```html-embed ` blocks in a sandboxed iframe only when `embedOrigin` is also set). zenn-cli always enables it in the preview.
- Embeds (`src/embed.ts`):
  - Direct iframes: youtube, slideshare, speakerdeck, docswell, jsfiddle, codepen, codesandbox, stackblitz, blueprintue, figma.
  - Via the embed server (`EmbedServerType`, requires `embedOrigin`): tweet, card, gist, github, mermaid, and `html` (` ```html-embed ` only). Without `embedOrigin`, tweet/card/gist/github fall back to links and mermaid stays a code block.

## zenn-model

- Types in `src/types.ts`. `validateArticle`, `validateBook`, and `validateBookChapter` (`src/index.ts`) run arrays of `ItemValidator` objects defined in `src/utils.ts` (`type`, `isCritical`, `getMessage`, `isValid`, `detailUrl`). The CLI shows critical errors and warnings differently.

## Development

```bash
pnpm install
pnpm build          # turbo build (zenn-cli tests and e2e use built packages)
pnpm lint-strict    # what CI runs
pnpm test
pnpm fix            # eslint --fix + prettier

# zenn-cli
pnpm -C packages/zenn-cli dev          # dev:server (nodemon + tsx) and dev:client (vite)
pnpm -C packages/zenn-cli test:server  # also test:client
pnpm -C packages/zenn-cli e2e
```

- Node `^22.22.2 || ^24.15.0 || >=26.0.0` and pnpm. A pre-commit hook (simple-git-hooks) runs `secretlint`.
- Tests use Vitest. zenn-cli has separate client, server, and e2e configs; API tests use supertest. CI (`test.yml`) runs tests for zenn-markdown-html, zenn-cli, and zenn-embed-elements.
- Other workflows: `lint.yml`, `e2e.yml` (Linux and Windows), `validate-pr.yml` (required labels), `actions-check.yml` (zizmor), `publish.yml`.

### Prompt Testing Policy

- Do not assert exact prompt wording or partial prompt text with equality or containment checks in tests (e.g. the AI scan prompts in zenn-cli).
- Prompts are qualitative configuration. Wording-based assertions unnecessarily prevent prompt improvements without guaranteeing actual LLM judgment quality.
- Test structural and behavioral contracts instead, such as provider/model selection, structured output schemas, retry and telemetry settings, data-flow boundaries, and fail-open/fail-closed behavior.
- Evaluate prompt quality with representative LLM eval cases rather than string-matching tests.

## Common Changes

- **Markdown feature**: add `src/utils/md-*.ts` in zenn-markdown-html, register it in `src/index.ts`, and update the allowlist in `src/sanitizer.ts` if new tags or attributes are emitted. Add XSS cases to `__tests__/xss.test.ts`.
- **Embed type**: add it to `EmbedType` and `embedGenerators` in `src/embed.ts` (`embedKeys` is derived automatically, which also enables the `@[type](...)` syntax), add a URL matcher in `src/utils/url-matcher.ts`, add it to `EmbedServerType` if it uses the embed server, allow any new iframe attributes in `src/sanitizer.ts`, and style it in `zenn-content-css/src/_embed.scss`.
- **Validation rule**: add an `ItemValidator` in zenn-model `src/utils.ts`, add its type to `ValidationErrorType` in `src/types.ts`, and add it to the array in `validateArticle` / `validateBook` / `validateBookChapter`.
- **API endpoint**: `zenn-cli/src/server/app.ts` and `src/server/api/*.ts`.
- **CLI command**: `zenn-cli/src/server/commands/` and `commands/index.ts`.
