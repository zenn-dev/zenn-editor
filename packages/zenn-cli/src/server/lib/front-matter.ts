import { JSON_SCHEMA, load } from 'js-yaml';

const DELIMITER = '---';
const CLOSE_DELIMITER = `\n${DELIMITER}`;

export type FrontMatterResult = {
  data: Record<string, unknown>;
  content: string;
};

/**
 * front matter を YAML (JSON_SCHEMA) として解析し、本文と分離する
 *
 * 区切りの判定は gray-matter@4.0.3 と同じにしている。
 * ただし `---js` のように区切りの後ろに言語名があるものは front matter として扱わず、ファイル全体を本文とする。
 * gray-matter は言語名に応じたエンジンで解析し、js の場合は eval で評価してしまうため。
 *
 * NOTE: yaml の timestamp フィールドが Date に変換されないように JSON_SCHEMA を使う
 */
export function parseFrontMatter(raw: string): FrontMatterResult {
  const str = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const bodyOnly = { data: {}, content: str };

  if (!str.startsWith(DELIMITER)) return bodyOnly;
  // `----` のように区切りの直後も `-` なら front matter ではない
  if (str.charAt(DELIMITER.length) === '-') return bodyOnly;

  const rest = str.slice(DELIMITER.length);
  const firstLineEnd = rest.search(/\r?\n/);
  const language = firstLineEnd === -1 ? rest : rest.slice(0, firstLineEnd);
  if (language.trim() !== '') return bodyOnly;

  const closeIndex = rest.indexOf(CLOSE_DELIMITER);
  const matter = closeIndex === -1 ? rest : rest.slice(0, closeIndex);
  const content =
    closeIndex === -1
      ? ''
      : rest
          .slice(closeIndex + CLOSE_DELIMITER.length)
          .replace(/^\r/, '')
          .replace(/^\n/, '');

  const block = matter.replace(/^\s*#[^\n]+/gm, '').trim();
  if (block === '') return { data: {}, content };

  const data = load(matter, { schema: JSON_SCHEMA });
  return { data: isPlainObject(data) ? data : {}, content };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
