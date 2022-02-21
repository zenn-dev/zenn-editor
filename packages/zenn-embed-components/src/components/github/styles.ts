import { css } from '@emotion/react';

/**
 * Github埋め込みのスタイル
 */
export const embedGithubStyle = css`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgb(160, 160, 160, 0.3);
`;

/**
 * ステータス(Error,Loading)のラベルのスタイル
 */
export const statusMessageStyle = css`
  color: gray;
  text-align: center;
  font-size: 0.9rem;
`;

/**
 * コードブロックのテーマスタイル
 * @note
 * VS theme by Andrew Lock (https://andrewlock.net)
 * Inspired by Visual Studio syntax coloring
 */
export const codeBlockThemeStyle = css`
  position: relative;
  color: #393a34;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  font-size: 0.9em;
  line-height: 20px;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  overflow: auto;
  background-color: white;
  padding: 1em;
  padding-left: 4.8em;
  margin: 0px;
  max-height: 300px;

  &::-moz-selection,
  & ::-moz-selection {
    background: #c1def1;
  }

  &::selection,
  & ::selection {
    background: #c1def1;
  }

  code {
    color: #0000ff;
    position: relative;
    white-space: inherit;

    &::-moz-selection,
    & ::-moz-selection {
      background: #c1def1;
    }

    &::selection,
    & ::selection {
      background: #c1def1;
    }
  }

  .token {
    &.comment,
    &.prolog,
    &.doctype,
    &.cdata {
      color: #008000;
      font-style: italic;
    }

    &.namespace {
      opacity: 0.7;
    }

    &.string {
      color: #a31515;
    }

    &.punctuation,
    &.operator {
      color: #393a34; /* no highlight */
    }

    &.url,
    &.symbol,
    &.number,
    &.boolean,
    &.variable,
    &.constant,
    &.inserted {
      color: #36acaa;
    }

    &.function {
      color: #393a34;
    }

    &.tag,
    &.selector {
      color: #800000;
    }

    &.attr-name,
    &.property,
    &.regex,
    &.entity {
      color: #ff0000;
    }

    &.important {
      color: #e90;
    }

    &.important,
    &.bold {
      font-weight: bold;
    }

    &.italic {
      font-style: italic;
    }

    &.directive.tag .tag {
      background: #ffff00;
      color: #393a34;
    }

    &.atrule,
    &.keyword,
    &.attr-value {
      color: #0000ff;
    }

    &.deleted {
      color: #9a050f;
    }

    &.selector {
      color: #00009f;
    }

    &.class-name {
      color: #2b91af;
    }
  }

  .language-autohotkey {
    .token {
      &.number,
      &.boolean,
      &.token.selector {
        color: #0000ff;
      }

      &.tag {
        color: #9a050f;
      }

      &.keyword {
        color: #00009f;
      }

      &.property {
        color: #2b91af;
      }
    }
  }
`;

/**
 * コードブロック内の行番号のスタイル
 */
export const lineNumbersStyle = css`
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

  & > span {
    display: block;
    text-align: right;
    padding-right: 16px;
    color: rgb(110 119 129);
  }
`;
