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
.embedded-github .message {
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

export const cssText = `
${embedGithubStyle}
${themeStyle}
${lineNumberStyle}
`;
