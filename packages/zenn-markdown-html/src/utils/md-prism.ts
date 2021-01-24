import Prism, { Grammar } from 'prismjs';
import loadLanguages from 'prismjs/components/';
import enableDiffHighlight from '@steelydylan/prism-diff-highlight';
import MarkdownIt from 'markdown-it';

// diffプラグインを有効化
enableDiffHighlight();

interface Options {
  plugins: string[];
  /**
   * Callback for Prism initialisation. Useful for initialising plugins.
   * @param prism The Prism instance that will be used by the plugin.
   */
  init: (prism: typeof Prism) => void;
}

const DEFAULTS: Options = {
  plugins: [],
  init: () => {
    // do nothing by default
  },
};

/**
 * Loads the provided {@code lang} into prism.
 *
 * @param lang
 *        Code of the language to load.
 * @param isDiff
 *        whether to use diff with language or not
 * @return The Prism language object for the provided {@code lang} code. {@code undefined} if the language is not known to Prism.
 */
function loadPrismLang(lang: string): Grammar | undefined {
  if (!lang) return undefined;
  let langObject = Prism.languages[lang];
  if (langObject === undefined) {
    loadLanguages([lang]);
    langObject = Prism.languages[lang];
  }
  return langObject;
}

/**
 * Check given lang should be treated as `diff` and parse name of language.
 *
 * @param lang
 *        String given by `markdown-it`. this must be lower case.
 * @return  whether `lang` includes `diff` or not, and parsed name if recognized as `diff`.
 *          If not, return `lang` directly.
 *
 */
function checkIncludingDiff(lang: string) {
  // TODO: Determine the method to find `diff`(`match`, `indexOf` e.t.c.).
  const langs = lang.split('-');
  const hasDiff = langs.some((lang) => lang === 'diff');
  if (hasDiff) {
    const newLang = langs.find((lang) => lang !== 'diff') ?? '';
    return {
      isDiff: true,
      lang: newLang,
    };
  }
  return {
    isDiff: false,
    lang,
  };
}

const fallbackLanguages: {
  [key: string]: string;
} = {
  vue: 'html',
  fish: 'shell',
  sh: 'shell',
  cwl: 'yaml',
};

/**
 * Select the language to use for highlighting, based on the provided options and the specified language.
 *
 * @param lang
 *        Code of the language to highlight the text in.
 * @return  The name of the language to use and the Prism language object for that language.
 */
function selectLanguage(lang: string) {
  const loweredLang = lang?.toLowerCase() || '';
  const { isDiff, lang: langNormalized } = checkIncludingDiff(loweredLang);
  const langAlias = fallbackLanguages[langNormalized];
  const langToUse = langAlias || langNormalized;
  const prismLang = loadPrismLang(langToUse);
  return {
    langToUse,
    grammer: prismLang,
    isDiff,
  };
}

/**
 * Highlights the provided text using Prism.
 *
 * @param markdownit
 *        The markdown-it instance
 * @param text
 *        The text to highlight.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return {@code text} wrapped in {@code &lt;pre&gt;} and {@code &lt;code&gt;}, both equipped with the appropriate class
 *  (markdown-it’s langPrefix + lang). If Prism knows {@code lang}, {@code text} will be highlighted by it.
 */
function highlight(markdownit: MarkdownIt, text: string, lang: string): string {
  const { langToUse, isDiff, grammer } = selectLanguage(lang);
  // 1. Use `diff` highlight with `language` if set.
  // 2. Use `language` (or `diff`, which is included) only.
  // 3. Use plain Markdown.
  const code = grammer
    ? isDiff
      ? Prism.highlight(text, Prism.languages.diff, 'diff-' + langToUse)
      : Prism.highlight(text, grammer, langToUse)
    : isDiff
    ? Prism.highlight(text, Prism.languages.diff, 'diff')
    : markdownit.utils.escapeHtml(text);

  const classAttribute = langToUse
    ? isDiff
      ? ` class="diff-highlight ${
          markdownit.options.langPrefix
        }diff-${markdownit.utils.escapeHtml(langToUse)}"`
      : ` class="${markdownit.options.langPrefix}${markdownit.utils.escapeHtml(
          langToUse
        )}"`
    : '';
  return `<pre${classAttribute}><code${classAttribute}>${code}</code></pre>`;
}

/**
 * Initialisation function of the plugin. This function is not called directly by clients, but is rather provided
 * to MarkdownIt’s {@link MarkdownIt.use} function.
 *
 * @param markdownit
 *        The markdown it instance the plugin is being registered to.
 * @param useroptions
 *        The options this plugin is being initialised with.
 */
export function mdPrism(markdownit: MarkdownIt, useroptions: Options): void {
  const options = Object.assign({}, DEFAULTS, useroptions);
  options.init(Prism);
  // register ourselves as highlighter
  markdownit.options.highlight = (...args) => highlight(markdownit, ...args);
}
