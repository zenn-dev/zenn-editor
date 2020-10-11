// override: https://github.com/markdown-it/markdown-it/blob/11.0.1/lib/renderer.js
import MarkdownIt from 'markdown-it'
import { unescapeAll, escapeHtml } from 'markdown-it/lib/common/utils'
import Token from 'markdown-it/lib/token';

export function customRendererFence(markdownit: MarkdownIt): void {

    markdownit.renderer.rules.fence = function (tokens, idx, options, env, slf) {
  var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : '',
      langName = '',
      fileNameTag = '',
      langInfo, highlighted, i, tmpAttrs, tmpToken;

  if (info) {
    langInfo = info.split(/\s+/g)[0].split(/:/g);
    langName = langInfo[0];
    if (langInfo.length > 1 && langInfo[1]) {
      fileNameTag = '<div class="code-file-name">' + escapeHtml(langInfo[1]) + '</div>';
    }
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  if (highlighted.indexOf('<pre') === 0) {
    if (fileNameTag) {
      return highlighted.replace(/^<pre[^>]*>/, '$&' + fileNameTag) + '\n';
    } else {
      return highlighted + '\n';
    }
  }

  // If language exists, inject class gently, without modifying original token.
  // May be, one day we will add .clone() for token and simplify this part, but
  // now we prefer to keep things local.
  if (langName) {
    i        = token.attrIndex('class');
    tmpAttrs = token.attrs ? token.attrs.slice() : [];

    if (i < 0) {
      tmpAttrs.push([ 'class', options.langPrefix + langName ]);
    } else {
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
    }

    // Fake token just to render attributes
    tmpToken = {
      attrs: tmpAttrs
    } as Token;

    return  '<pre>' + fileNameTag + '<code' + slf.renderAttrs(tmpToken) + '>'
    + highlighted
    + '</code></pre>\n';
  }

  return  '<pre>' + fileNameTag + '<code' + slf.renderAttrs(token) + '>'
        + highlighted
        + '</code></pre>\n';

  };
}