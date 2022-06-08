import Prism from 'prismjs';
import components from 'prismjs/components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import getLoader from 'prismjs/dependencies';

const loadedLanguages = new Set<string>();

export default function loadLanguages(languages: string | string[]) {
  if (languages === undefined) {
    languages = Object.keys(components.languages).filter((l) => l != 'meta');
  } else if (!Array.isArray(languages)) {
    languages = [languages];
  }

  // the user might have loaded languages via some other way or used `prism.js` which already includes some
  // we don't need to validate the ids because `getLoader` will ignore invalid ones
  const loaded = [...loadedLanguages, ...Object.keys(Prism.languages)];

  getLoader(components, languages, loaded).load((lang: string) => {
    if (!(lang in components.languages)) {
      if (!loadLanguages.silent) {
        console.warn('Language does not exist: ' + lang);
      }
      return;
    }

    try {
      require(`prismjs/components/prism-${lang}`);
    } catch (e) {
      console.error(e);
    }

    loadedLanguages.add(lang);
  });
}

/**
 * Set this to `true` to prevent all warning messages `loadLanguages` logs.
 */
loadLanguages.silent = false;
