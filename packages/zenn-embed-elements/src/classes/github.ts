/** Github REST APIの contents のレスポンス */
type GithubSourceCodeResult = {
  sha: string;
  repo: string;
  owner: string;
  content: string;
  filePath: string;
  maxLine: number;
  startLine: number;
  endLine?: number;
};

// Github REST APIのリクエストに必要な情報をパーマリンクから取得するための正規表現
const GITHUB_PERMALINK_PATTERN =
  /^https:\/\/github\.com\/([a-zA-Z0-9-]{0,38})\/([a-zA-Z0-9-]{0,38})\/blob\/([a-z0-9]+)\/([\w!\-_~.*%()'"/]+)(?:#L(\d+)(?:-L(\d+))?)?/;

// ホットリロード等、再レンダリング時のちらつきを防ぐためにhtmlの値をキャッシュする（リロードで消える）
const resultHtmlStore: {
  [cacheKey: string]: string;
} = {};

export class EmbedGithub extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const cachedHtml = resultHtmlStore[this.getCacheKey()];

    if (cachedHtml) {
      shadowRoot.innerHTML = cachedHtml;
    }
  }

  getCacheKey() {
    return encodeURIComponent(this.getAttribute('page-url') || '');
  }

  getSourceCodeInfo(url: string) {
    const result = url.match(GITHUB_PERMALINK_PATTERN);

    if (!result) return;

    const [, owner, repo, sha, filePath, startLine, endLine] = result;

    return {
      sha,
      repo,
      owner,
      filePath,
      endLine: +endLine > 0 ? +endLine : void 0,
      startLine: +startLine > 0 ? +startLine : 1,
    };
  }

  async getGithubSourceCode(url: string): Promise<GithubSourceCodeResult> {
    const info = this.getSourceCodeInfo(url);

    if (!info) throw new Error('BAD URL');

    const query = `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.sha}/${info.filePath}`;

    const file = await fetch(query).then((res) => res.text());

    // 最後に改行が含まれているとズレるので、削除してから split する
    const lines = file.replace(/\n$/, '').split('\n');

    return {
      ...info,
      maxLine: lines.length,
      content: lines.slice(info.startLine - 1, info.endLine).join('\n'),
    };
  }

  async connectedCallback() {
    const root = this.shadowRoot;
    const url = this.getAttribute('page-url');

    if (!(root && url)) return; // ルートDOMが表示されてない又は、URLが設定されてない場合は表示しない
    if (resultHtmlStore[this.getCacheKey()]) return; // キャッシュがある場合は再リクエストしない

    try {
      const result = await this.getGithubSourceCode(url);
      const Prism = await import('prismjs');

      const highlight = (code: string): string => {
        return Prism.highlight(code, Prism.languages.clike, 'clike');
      };

      this.render(root, result, highlight);
    } catch {
      this.renderError(root);
    }
  }

  renderHeader(result: Partial<GithubSourceCodeResult>): string {
    const sha = result.sha?.slice(0, 7);
    const { startLine, maxLine } = result;
    const endLine = result.endLine || maxLine;

    // prettier-ignore
    return `
      <header class="header">
        <div class="gh-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%" fill="currentColor"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        </div>
        <div class="container">
          <p class="label">
            <a href="${this.getAttribute('page-url')}" target="_blank" rel="noreferrer noopener">
              ${result.owner}/${result.repo}/${result.filePath}
            </a>
          </p>
          <p class="label">Lines ${startLine} to ${endLine} in ${sha}</p>
        </div>
      </header>
    `;
  }

  renderError(root: ShadowRoot) {
    const url = this.getAttribute('page-url');
    const result = this.getSourceCodeInfo(url || '');

    // prettier-ignore
    root.innerHTML = `
      <style>${embedGithubStyle}</style>
      <div class="embedded-github">
        ${this.renderHeader({ ...result })}
        <div class="error-message">
          <p>Githubの読み込みに失敗しました</p>
        </div>
      </div>
    `
  }

  render(
    root: ShadowRoot,
    result: GithubSourceCodeResult,
    highlight: (code: string) => string
  ) {
    const sourceCode = highlight(result.content);
    const startLine = result.startLine - 1;
    const lines = (result.endLine || result.maxLine) - startLine;

    // prettier-ignore
    const lineNumbersHTML = `<span class="line-numbers-rows">${[...Array(lines),].map((_, i) => `<span>${i + 1 + startLine}</span>`).join('')}</span>`

    const resultHtml = `
      <style>${cssText}</style>
      <div class="embedded-github">
        ${this.renderHeader(result)}
        <pre class="language-clike"><code>${sourceCode}${lineNumbersHTML}</code></pre>
      </div>
    `;

    // gistのhtmlをキャッシュする
    resultHtmlStore[this.getCacheKey()] = resultHtml;
    root.innerHTML = resultHtml;
  }
}

const themeStyle = `
  /**
   * VS theme by Andrew Lock (https://andrewlock.net)
   * Inspired by Visual Studio syntax coloring
   */
  pre[class*="language-"] {
    color: #393A34;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    font-size: .9em;
    line-height: 20px;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
  code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
    background: #C1DEF1;
  }

  pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
  code[class*="language-"]::selection, code[class*="language-"] ::selection {
    background: #C1DEF1;
  }

  /* Code blocks */
  pre[class*="language-"] {
    padding: 1em;
    margin: .5em 0;
    overflow: auto;
    background-color: white;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #008000;
    font-style: italic;
  }

  .token.namespace {
    opacity: .7;
  }

  .token.string {
    color: #A31515;
  }

  .token.punctuation,
  .token.operator {
    color: #393A34; /* no highlight */
  }

  .token.url,
  .token.symbol,
  .token.number,
  .token.boolean,
  .token.variable,
  .token.constant,
  .token.inserted {
    color: #36acaa;
  }

  .token.atrule,
  .token.keyword,
  .token.attr-value,
  .language-autohotkey .token.selector,
  .language-json .token.boolean,
  .language-json .token.number,
  code[class*="language-css"] {
    color: #0000ff;
  }

  .token.function {
    color: #393A34;
  }

  .token.deleted,
  .language-autohotkey .token.tag {
    color: #9a050f;
  }

  .token.selector,
  .language-autohotkey .token.keyword {
    color: #00009f;
  }

  .token.important {
    color: #e90;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.class-name,
  .language-json .token.property {
    color: #2B91AF;
  }

  .token.tag,
  .token.selector {
    color: #800000;
  }

  .token.attr-name,
  .token.property,
  .token.regex,
  .token.entity {
    color: #ff0000;
  }

  .token.directive.tag .tag {
    background: #ffff00;
    color: #393A34;
  }
`;

const lineNumberStyle = `
  pre[class*="language-"] {
    position: relative;
    padding-left: 4.8em !important;
    counter-reset: linenumber;
  }

  pre[class*="language-"] > code {
    position: relative;
    white-space: inherit;
  }

  .line-numbers-rows {
    position: absolute;
    pointer-events: none;
    top: 0;
    font-size: 100%;
    left: -3em;
    width: 3em; /* works for line-numbers below 1000 lines */
    letter-spacing: -1px;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .line-numbers-rows > span {
    display: block;
    text-align: right;
    padding-right: 16px;
    color: rgb(110 119 129);
  }
`;

const embedGithubStyle = `
.embedded-github {
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgb(160, 160, 160, 0.3);
}

.embedded-github > .header {
  display: flex;
  background: rgb(246 248 250);
  padding: 8px 16px;
  border-bottom: 1px solid rgb(160, 160, 160, 0.3);
}

.embedded-github > .header > .container {
  margin-left: 8px;
}

.embedded-github > .header a {
  font-weight: 600;
  text-decoration: unset;
  color: rgb(9 105 218);
}

.embedded-github > .header a:hover {
  text-decoration: underline;
}

.embedded-github > .header .label {
  line-height: 1.25;
  font-size: 12px;
  color: rgb(87 96 106);
  padding: 0;
  margin: 0;
}

.embedded-github pre {
  padding: 0 16px;
  margin: 0px;
  max-height: 300px;
}

.embedded-github .error-message {
  text-align: center;
  color: gray;
  font-size: 0.9rem;
}

.embedded-github .gh-icon {
  width: 21px;
  height: 21px;
  align-self: center;
  color: rgb(96 105 113);
}
`;

const cssText = `
${embedGithubStyle}
${themeStyle}
${lineNumberStyle}
`;
