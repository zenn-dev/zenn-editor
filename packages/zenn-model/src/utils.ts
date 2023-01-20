import initEmojiRegex from 'emoji-regex';
import { ItemValidator } from './types';

export function validateSlug(slug: string) {
  if (!slug) return false;
  return /^[0-9a-z\-_]{12,50}$/.test(slug);
}

export function validateChapterSlug(slug: string) {
  if (!slug) return false;
  // n.slug.mdも許容
  return (
    /^[0-9a-z\-_]{1,50}$/.test(slug) || /^[0-9]+.[0-9a-z\-_]{1,50}$/.test(slug)
  );
}

export function isAnyText(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0;
}

export const validateItemSlug: ItemValidator = {
  type: 'item-slug',
  isCritical: true,
  getMessage: ({ slug }) =>
    `slugの値（${slug}）が不正です。小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の12〜50字の組み合わせにしてください`,
  isValid: ({ slug }) => validateSlug(slug),
};

export const validateMissingTitle: ItemValidator = {
  type: 'missing-title',
  isCritical: true,
  getMessage: () => 'title（タイトル）を文字列で入力してください',
  isValid: ({ title }) => isAnyText(title),
};

export const validateTitleLength: ItemValidator = {
  type: 'title-length',
  isCritical: true,
  getMessage: () => 'タイトルは70字以内にしてください',
  isValid: ({ title }) => {
    if (!isAnyText(title)) return true; // skip as duplicate of validateMissingTitle
    return title.length <= 70;
  },
};

export const validatePublishedStatus: ItemValidator = {
  type: 'published-status',
  isCritical: true,
  getMessage: () =>
    'published（公開設定）を true か false で指定してください（クオテーション " で囲まないでください）',
  isValid: ({ published }) => {
    return typeof published === 'boolean';
  },
};

/** `published_at`に設定できる日付表記の正規表現 */
export const PUBLISHED_AT_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}(\s[0-9]{2}:[0-9]{2})?$/;

// JavaScriptでパースしたときとサーバー側でパースしたときのTZを確実に合わせるため、フォーマットを固定します。
export const validatePublishedAtParse: ItemValidator = {
  type: 'published-at-parse',
  isCritical: true,
  getMessage: () =>
    'published_at（公開日時）は `YYYY-MM-DD` または `YYYY-MM-DD hh:mm` のフォーマットで指定してください',
  isValid: ({ published_at: publishedAt }) => {
    if (publishedAt == undefined) return true;
    if (!publishedAt.match(PUBLISHED_AT_PATTERN)) return false;

    // safari でも Data.parse() できるように `YYYY-MM-DDThh:mm` のフォーマットに修正する
    return !isNaN(Date.parse(publishedAt.replace(' ', 'T')));
  },
};

export const validatePublishedAtSchedule: ItemValidator = {
  type: 'published-at-schedule',
  isCritical: true,
  getMessage: () =>
    'published_at（公開日時）に未来の日時を指定する場合は、published（公開設定）に true を指定してください（公開日時を過ぎるとZennのサービス上で自動的に公開されます）',
  isValid: ({ published, published_at: publishedAt }) => {
    if (published === true) return true;
    if (publishedAt == null) return true;

    if (isNaN(Date.parse(publishedAt))) {
      return true; // Date.parseに失敗する場合、このvalidationではエラーとしない
    } else {
      return Date.parse(publishedAt) < Date.now();
    }
  },
};

export const validateArticleType: ItemValidator = {
  type: 'article-type',
  isCritical: true,
  detailUrl: 'https://zenn.dev/tech-or-idea',
  detailUrlText: '詳細を開く',
  getMessage: () =>
    'type（記事のタイプ）に tech もしくは idea を指定してください。技術記事の場合は tech を指定してください',
  isValid: ({ type }) => {
    if (!type) return false;
    return type === 'tech' || type === 'idea';
  },
};

export const validateMissingEmoji: ItemValidator = {
  type: 'missing-emoji',
  detailUrl: 'https://getemoji.com',
  detailUrlText: '絵文字を探す',
  getMessage: () => 'アイキャッチとなる emoji（絵文字）を指定してください',
  isValid: ({ emoji }) => isAnyText(emoji),
};

export const validateEmojiFormat: ItemValidator = {
  type: 'emoji-format',
  isCritical: true,
  getMessage: () => '絵文字（emoji）を1つだけ指定してください',
  isValid: ({ emoji }) => {
    if (!isAnyText(emoji)) return true; // skip as duplicate of validateMissingEmoji
    const emojiRegex = initEmojiRegex();
    const matches = emoji.match(emojiRegex);
    if (!matches || !matches[0] || matches[1]) return false;
    return true;
  },
};

export const validateMissingTopics: ItemValidator = {
  type: 'missing-topics',
  isCritical: false,
  getMessage: () =>
    'topics（記事に関連する言語や技術）を配列で指定してください。例）["react", "javascript"]',
  isValid: ({ topics }) => {
    if (!Array.isArray(topics)) return false;
    return topics.length > 0;
  },
};

export const validateTooManyTopics: ItemValidator = {
  type: 'too-many-topics',
  isCritical: true,
  getMessage: () => 'topicsは最大5つまで指定できます',
  isValid: ({ topics }) => {
    if (!Array.isArray(topics)) return true; // skip as duplicate of validateMissingTopics
    return topics.length <= 5;
  },
};

export const validateTopicType: ItemValidator = {
  type: 'topic-type',
  isCritical: true,
  getMessage: () => 'topicsは全て文字列で指定してください',
  isValid: ({ topics }) => {
    if (!Array.isArray(topics)) return true; // skip as duplicate of validateMissingTopics
    return topics.every((t) => typeof t === 'string' && t.length > 0);
  },
};

export const validateInvalidTopicLetters: ItemValidator = {
  type: 'invalid-topic-letters',
  getMessage: () =>
    'topicsに記号やスペースを使用することはできません。例えばC++は「cpp」、C#は「csharp」と記載してください',
  isValid: ({ topics }) => {
    if (!Array.isArray(topics)) return true; // skip as duplicate of validateMissingTopics
    const anyInvalidFormat = topics.some(
      (t) => typeof t === 'string' && t.match(/[ -/:-@[-`{-~]/g)
    );
    return !anyInvalidFormat;
  },
};

export const validateUseTags: ItemValidator = {
  type: 'use-tags',
  getMessage: () => 'tagsではなくtopicsを使ってください',
  isValid: (item) => !(item as any).tags?.length && !(item as any).tag?.length,
};

export const validatePublicationName: ItemValidator = {
  type: 'publication-name',
  isCritical: true,
  getMessage: () =>
    'Publicationの名前が不正です。小文字の半角英数字（a-z0-9）、アンダースコア（_）の2〜15字の組み合わせにしてください',
  isValid: ({ publication_name }) => {
    if (!publication_name) return true;
    return /^[0-9a-z_]{2,15}$/.test(publication_name);
  },
};

export const validateBookSummary: ItemValidator = {
  type: 'book-summary',
  isCritical: true,
  getMessage: () => 'summary（本の説明）の記載は必須です',
  isValid: ({ summary }) => typeof summary === 'string' && summary.length > 0,
};

export const validateBookPriceType: ItemValidator = {
  type: 'book-price-type',
  isCritical: true,
  getMessage: () =>
    'price（本の価格）を半角数字で指定してください（クオテーション " で囲まないでください）',
  isValid: ({ price }) => typeof price === 'number',
};

export const validateBookPriceRange: ItemValidator = {
  type: 'book-price-range',
  isCritical: true,
  getMessage: () =>
    'price（本の価格）を有料にする場合、200〜5000の間で指定してください',
  isValid: ({ price }) => {
    if (typeof price !== 'number') return true; // skip as duplicate of validateBookPriceType
    if (price === 0) return true;
    return price >= 200 && price <= 5000;
  },
};

export const validateBookPriceFraction: ItemValidator = {
  type: 'book-price-fraction',
  isCritical: true,
  getMessage: () => 'price（本の価格）は100円単位で指定してください',
  isValid: ({ price }) => {
    if (typeof price !== 'number') return true; // skip as duplicate of validateBookPriceType
    return price % 100 === 0;
  },
};

export const validateMissingBookCover: ItemValidator = {
  type: 'missing-book-cover',

  getMessage: ({ slug }) =>
    `本のカバー画像（cover.pngもしくはcover.jpg）を「/books/${slug}」ディレクトリに配置してください`,
  isValid: ({ coverDataUrl }) => typeof coverDataUrl === 'string',
};

export const validateBookCoverSize: ItemValidator = {
  type: 'book-cover-size',
  isCritical: true,
  getMessage: (item) =>
    `カバー画像のサイズは1MB以内にしてください。現在のサイズ: ${
      item.coverFilesize
        ? `${Math.trunc(item.coverFilesize / 1024)}KB`
        : '取得できませんでした'
    }`,
  isValid: ({ coverDataUrl, coverFilesize }) => {
    if (typeof coverDataUrl !== 'string') return true; // skip as duplicate of validateMissingBookCover
    return typeof coverFilesize === 'number' && coverFilesize <= 1024 * 1024;
  },
};

function getAspectRatio(width?: number, height?: number) {
  if (!height || !width) return null;
  return Math.round((height / width) * 10) / 10;
}

export const validateBookCoverAspectRatio: ItemValidator = {
  type: 'book-cover-aspect-ratio',
  getMessage: (item) => {
    const currentAspectRatio = getAspectRatio(
      item.coverWidth,
      item.coverHeight
    );
    return `カバー画像の「幅 : 高さ」の比率は「1 : 1.4」にすることをおすすめします（最終的に幅500px・高さ700pxにリサイズされます）。${
      currentAspectRatio ? `現在の比率は「1 : ${currentAspectRatio}」です` : ''
    }`;
  },
  isValid: ({ coverDataUrl, coverHeight, coverWidth }) => {
    if (typeof coverDataUrl !== 'string') return true; // skip as duplicate of validateMissingBookCover
    const currentAspectRatio = getAspectRatio(coverWidth, coverHeight);
    return typeof currentAspectRatio === 'number' && currentAspectRatio === 1.4;
  },
};

export const validateBookChapterSlugs: ItemValidator = {
  type: 'book-chapter-slugs',
  isCritical: true,
  getMessage: () => `config.yamlの chapters の指定に誤りがあります`,
  detailUrl:
    'https://zenn.dev/zenn/articles/zenn-cli-guide#%F0%9F%93%84-config.yaml',
  isValid: ({ specifiedChapterSlugs }) => {
    if (specifiedChapterSlugs === undefined) return true; // specifiedChapterSlugs is optional
    // invaild if specifiedChapterSlugs is not array of string
    return (
      Array.isArray(specifiedChapterSlugs) &&
      specifiedChapterSlugs.every((slug) => typeof slug === 'string')
    );
  },
};

export const validateBookChaptersFormat: ItemValidator = {
  type: 'book-chapters-format',
  isCritical: true,
  getMessage: () =>
    `chapters に指定する文字列には拡張子（.md）を含めないでください。ファイル名が example.md であれば example とのみ記載してください`,
  detailUrl:
    'https://zenn.dev/zenn/articles/zenn-cli-guide#%F0%9F%93%84-config.yaml',
  isValid: ({ specifiedChapterSlugs }) => {
    if (!Array.isArray(specifiedChapterSlugs)) return true; // skip as duplicate of validateBookChapterSlugs
    const anyInvalidFormat = specifiedChapterSlugs.some(
      (slug) => typeof slug === 'string' && slug.match(/\.md$/)
    );
    return !anyInvalidFormat;
  },
};

export const validateChapterItemSlug: ItemValidator = {
  type: 'chapter-item-slug',
  isCritical: true,
  getMessage: ({ slug }) =>
    `チャプターのslugの値（${slug}）が不正です。小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の1〜50字の組み合わせにしてください`,
  isValid: ({ slug }) => validateChapterSlug(slug),
};

export const validateChapterFreeType: ItemValidator = {
  type: 'chapter-free-type',
  isCritical: true,
  getMessage: () =>
    'free（無料公開設定）には true もしくは falseのみを指定してください',
  isValid: ({ free }) => free === undefined || typeof free === 'boolean',
};
