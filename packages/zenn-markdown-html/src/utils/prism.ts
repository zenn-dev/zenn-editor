import Prism, { Grammar } from "prismjs";
import loadLanguages from "prismjs/components/";
import MarkdownIt from "markdown-it";

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

const fallbackLanguages:  {
  [key:string]: string;
} = {
  "vue": "html",
  "fish": "shell",
  "sh": "shell"
}

/**
 * Select the language to use for highlighting, based on the provided options and the specified language.
 *
 * @param options
 *        The options that were used to initialise the plugin.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return  The name of the language to use and the Prism language object for that language.
 */
function selectLanguage(lang: string): [string, Grammar | undefined] {
  const langNormalized = lang?.toLowerCase() || "";
  const langAlias = fallbackLanguages[langNormalized]
  const langToUse = langAlias || langNormalized
  const prismLang = loadPrismLang(langToUse);
  return [langToUse, prismLang];
}

/**
 * Highlights the provided text using Prism.
 *
 * @param markdownit
 *        The markdown-it instance
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param text
 *        The text to highlight.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return {@code text} wrapped in {@code &lt;pre&gt;} and {@code &lt;code&gt;}, both equipped with the appropriate class
 *  (markdown-it’s langPrefix + lang). If Prism knows {@code lang}, {@code text} will be highlighted by it.
 */
function highlight(markdownit: MarkdownIt, text: string, lang: string): string {
  const [langToUse, prismLang] = selectLanguage(lang);
  const code = prismLang
    ? Prism.highlight(text, prismLang, langToUse)
    : markdownit.utils.escapeHtml(text);
  const classAttribute = langToUse
    ? ` class="${markdownit.options.langPrefix}${markdownit.utils.escapeHtml(
        langToUse
      )}"`
    : "";
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
export default function markdownItPrism(
  markdownit: MarkdownIt,
  useroptions: Options
): void {
  const options = Object.assign({}, DEFAULTS, useroptions);

  options.init(Prism);

  // register ourselves as highlighter
  markdownit.options.highlight = (...args) => highlight(markdownit, ...args);
}
