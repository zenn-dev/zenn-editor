/**
 * forked from https://github.com/goessner/markdown-it-mdKatex
 */

import MarkdownIt from 'markdown-it';

type PreHandler = (str: string, begin: number) => boolean;
type PostHandler = (str: string, begin: number) => boolean;

const katexClassName = 'zenn-katex';

const preHandler: PreHandler = function (str, beg) {
  const prv = beg > 0 ? str[beg - 1].charCodeAt(0) : false;
  return (
    !prv ||
    (prv !== 0x5c && // no backslash,
      (prv < 0x30 || prv > 0x39))
  ); // no decimal digit .. before opening '$'
};

const postHandler: PostHandler = function (str, end) {
  const nxt = str[end + 1] && str[end + 1].charCodeAt(0);
  return !nxt || nxt < 0x30 || nxt > 0x39; // no decimal digit .. after closing '$'
};

type HandlingRule = {
  name: string;
  rex: RegExp;
  tmpl: string;
  tag: string;
  pre?: PreHandler;
  post?: PostHandler;
};

const inlineRules: HandlingRule[] = [
  {
    name: 'math_inline_double',
    rex: /\${2}((?:\S)|(?:\S(?!.*\]\(http).*?\S))\${2}/gy, // fixed so that the expression [$something](https://something.com/$example) is skipped.
    tmpl: `<section class="${katexClassName}"><embed-katex display-mode="1"><eqn>$1</eqn></embed-katex></section>`,
    tag: '$$',
    pre: preHandler,
    post: postHandler,
  },
  {
    name: 'math_inline',
    rex: /\$((?:\S)|(?:\S(?!.*\]\(http.*\$.*\)).*?\S))\$/gy, // fixed so that the expression [$something](https://something.com/$example) is skipped. (?:\S(?!.*\]\(http.*\$.*\)) means somthing like "](https://hoge.com/$/hoge)"
    tmpl: `<embed-katex><eq class="${katexClassName}">$1</eq></embed-katex>`,
    tag: '$',
    pre: preHandler,
    post: postHandler,
  },
];

const blockRules: HandlingRule[] = [
  {
    name: 'math_block_eqno',
    rex: /\${2}([^$]+?)\${2}\s*?\(([^)\s]+?)\)/gmy,
    tmpl: `<section class="${katexClassName} eqno"><eqn><embed-katex display-mode="1">$1</embed-katex></eqn><span>($2)</span></section>`,
    tag: '$$',
  },
  {
    name: 'math_block',
    rex: /\${2}([^$]+?)\${2}/gmy,
    tmpl: `<section class="${katexClassName}"><eqn><embed-katex display-mode="1">$1</embed-katex></eqn></section>`,
    tag: '$$',
  },
];

export function mdKatex(md: MarkdownIt) {
  for (const rule of inlineRules) {
    md.inline.ruler.before('escape', rule.name, function (state, silent) {
      const pos = state.pos;
      const str = state.src;
      const pre =
        str.startsWith(rule.tag, (rule.rex.lastIndex = pos)) &&
        (!rule.pre || rule.pre(str, pos)); // valid pre-condition ...
      const match = pre && rule.rex.exec(str);
      const res =
        !!match &&
        pos < rule.rex.lastIndex &&
        (!rule.post || rule.post(str, rule.rex.lastIndex - 1));

      if (res) {
        if (!silent && match) {
          const token = state.push(rule.name, 'math', 0);
          token.content = match[1];
          token.markup = rule.tag;
        }
        state.pos = rule.rex.lastIndex;
      }
      return res;
    }); // ! important
    md.renderer.rules[rule.name] = (tokens, idx) =>
      rule.tmpl.replace(/\$1/, md.utils.escapeHtml(tokens[idx].content));
  }

  for (const rule of blockRules) {
    md.block.ruler.before(
      'fence',
      rule.name,
      function block(state, begLine, endLine, silent) {
        const pos = state.bMarks[begLine] + state.tShift[begLine];
        const str = state.src;
        const pre =
          str.startsWith(rule.tag, (rule.rex.lastIndex = pos)) &&
          (!rule.pre || rule.pre(str, pos)); // valid pre-condition ....
        const match = pre && rule.rex.exec(str);
        const res =
          !!match &&
          pos < rule.rex.lastIndex &&
          (!rule.post || rule.post(str, rule.rex.lastIndex - 1));

        if (res && !silent && match) {
          // match and valid post-condition ...
          const endpos = rule.rex.lastIndex - 1;
          let curline;

          for (curline = begLine; curline < endLine; curline++)
            if (
              endpos >= state.bMarks[curline] + state.tShift[curline] &&
              endpos <= state.eMarks[curline]
            )
              // line for end of block math found ...
              break;

          // "this will prevent lazy continuations from ever going past our end marker"
          // s. https://github.com/markdown-it/markdown-it-container/blob/master/index.js
          const lineMax = state.lineMax;
          const oldParentType = state.parentType;
          state.lineMax = curline;
          // eslint-disable-next-line
          state.parentType = 'math' as any;

          if (oldParentType === 'blockquote') {
            // remove all leading '>' inside multiline formula
            match[1] = match[1].replace(/(\n*?^(?:\s*>)+)/gm, '');
          }
          // begin token
          let token = state.push(rule.name, 'math', 1); // 'math_block'
          token.block = true;
          token.markup = rule.tag;
          token.content = match[1];
          token.info = match[match.length - 1]; // eq.no
          token.map = [begLine, curline];
          // end token
          token = state.push(rule.name + '_end', 'math', -1);
          token.block = true;
          token.markup = rule.tag;

          state.parentType = oldParentType;
          state.lineMax = lineMax;
          state.line = curline + 1;
        }
        return res;
      }
    ); // ! important for ```math delimiters

    md.renderer.rules[rule.name] = (tokens, idx) =>
      rule.tmpl
        .replace(/\$2/, md.utils.escapeHtml(tokens[idx].info)) // equation number .. ?
        .replace(/\$1/, md.utils.escapeHtml(tokens[idx].content));
  }
}
