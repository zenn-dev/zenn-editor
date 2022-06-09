import Prism, { TokenStream } from 'prismjs';

/**
 * PrismJSのDiff構文を使用できるようにするためのプラグイン
 * ソースコードの大部分は、以下のファイルより抜き出したもの
 * @reference https://github.com/PrismJS/prism/blob/master/plugins/diff-highlight/prism-diff-highlight.js
 * @note `babel-plugin-prismjs`によって全ての言語プラグインを読み込んでいるため`locaLanguages()`の実行はしていない
 */
export function enableDiffHighlight() {
  const LANGUAGE_REGEX = /^diff-([\w-]+)/i;
  const HTML_TAG =
    /<\/?(?!\d)[^\s>/=$<%]+(?:\s(?:\s*[^\s>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/gi;

  //this will match a line plus the line break while ignoring the line breaks HTML tags may contain.
  const HTML_LINE = RegExp(
    /(?:__|[^\r\n<])*(?:\r\n?|\n|(?:__|[^\r\n<])(?![^\r\n])(?:__)?)(?:__)?/.source.replace(
      /__/g,
      function () {
        return HTML_TAG.source;
      }
    ),
    'gi'
  );

  let warningLogged = false;

  Prism.hooks.add('before-sanity-check', function (env) {
    const lang = env.language;
    if (LANGUAGE_REGEX.test(lang) && !env.grammar) {
      env.grammar = Prism.languages[lang] = Prism.languages.diff;
    }
  });
  Prism.hooks.add('before-tokenize', function (env) {
    if (!warningLogged && !Prism.languages.diff && !Prism.plugins.autoloader) {
      warningLogged = true;
      console.warn(
        "Prism's Diff Highlight plugin requires the Diff language definition (prism-diff.js)." +
          "Make sure the language definition is loaded or use Prism's Autoloader plugin."
      );
    }

    const lang = env.language;
    if (LANGUAGE_REGEX.test(lang) && !Prism.languages[lang]) {
      Prism.languages[lang] = Prism.languages.diff;
    }
  });

  Prism.hooks.add('wrap', function (env) {
    let diffLanguage = '',
      diffGrammar;

    if (env.language !== 'diff') {
      const langMatch = LANGUAGE_REGEX.exec(env.language);
      if (!langMatch) {
        return; // not a language specific diff
      }

      diffLanguage = langMatch[1];
      diffGrammar = Prism.languages[diffLanguage];
    }

    /**
     * A map from the name of a block to its line prefix, same as `Prism.languages.diff.PREFIXES`
     *
     * @type {Object<string, string>}
     */
    const DIFF_PREFIXES = {
      'deleted-sign': '-',
      'deleted-arrow': '<',
      'inserted-sign': '+',
      'inserted-arrow': '>',
      unchanged: ' ',
      diff: '!',
    };

    const PREFIXES = Prism.languages.diff && DIFF_PREFIXES;

    type PREFIXEKeys = keyof typeof PREFIXES;

    // one of the diff tokens without any nested tokens
    if (PREFIXES && env.type in PREFIXES) {
      /** @type {string} */
      const content = env.content.replace(HTML_TAG, ''); // remove all HTML tags

      /** @type {string} */
      const decoded = content.replace(/&lt;/g, '<').replace(/&amp;/g, '&');

      // remove any one-character prefix
      const code = decoded.replace(/(^|[\r\n])./g, '$1');

      // highlight, if possible
      let highlighted: string | TokenStream;
      if (diffLanguage && diffGrammar) {
        highlighted = Prism.highlight(code, diffGrammar, diffLanguage);
      } else {
        highlighted = Prism.util.encode(code);
      }

      // get the HTML source of the prefix token
      const prefixToken = new Prism.Token(
        'prefix',
        PREFIXES[env.type as PREFIXEKeys],
        [(/\w+/.exec(env.type) as string[])[0]]
      );
      const prefix = Prism.Token.stringify(prefixToken, env.language);

      // add prefix
      const lines = [];
      let m;
      HTML_LINE.lastIndex = 0;
      while ((m = HTML_LINE.exec(highlighted as string))) {
        lines.push(prefix + m[0]);
      }
      if (/(?:^|[\r\n]).$/.test(decoded)) {
        // because both "+a\n+" and "+a\n" will map to "a\n" after the line prefixes are removed
        lines.push(prefix);
      }
      env.content = lines.join('');

      if (diffGrammar) {
        env.classes.push('language-' + diffLanguage);
      }
    }
  });
}
