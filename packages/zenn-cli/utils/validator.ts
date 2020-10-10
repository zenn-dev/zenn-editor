import escapeHtml from "escape-html";
import initEmojiRegex from "emoji-regex/text.js";

const emojiRegex = initEmojiRegex();

import {
  Item,
  Article,
  Book,
  Chapter,
  ItemValidator,
  ErrorMessages,
  ErrorMessage,
} from "@types";

import {
  validateSlug,
  getSlugErrorMessage,
  validateChapterSlug,
  getChapterSlugErrorMessage,
} from "@utils/shared/slug-helper";

const validateItemSlug: ItemValidator = {
  isCritical: true,
  getMessage: (item: Article | Book) => getSlugErrorMessage(item.slug),
  isInvalid: (item: Article | Book) => !validateSlug(item.slug),
};

const validateMissingTitle: ItemValidator = {
  isCritical: true,
  getMessage: () => "title（タイトル）を入力してください",
  isInvalid: (item: Item) => !item.title?.length,
};

const validateTitleLength: ItemValidator = {
  isCritical: true,
  getMessage: () => "タイトルは60字以内にしてください",
  isInvalid: (item: Item) => {
    return item.title && item.title?.length > 60;
  },
};

const validateArticleType: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    'type（記事のタイプ）にtechもしくはideaを指定してください。技術記事の場合はtechを指定してください<br/><a href="https://zenn.dev/tech-or-idea" target="_blank">詳細はこちら →</a>',
  isInvalid: (item: Article) => {
    return !item.type || !(item.type === "tech" || item.type === "idea");
  },
};

const validateEmojiFormat: ItemValidator = {
  isCritical: true,
  getMessage: () => "絵文字（emoji）を1つだけ指定してください",
  isInvalid: (item: Article) => {
    const emoji = item?.emoji;
    if (!emoji) return false;
    // TODO: 「絵文字 + 絵文字以外の文字列」でもinvalidにならない問題の解消
    const matches = emoji.match(emojiRegex);
    if (!matches || !matches[0] || matches[1]) return true;
    return false;
  },
};

const validateMissingEmoji: ItemValidator = {
  getMessage: () =>
    'アイキャッチとなるemoji（絵文字）を指定してください<br/><a href="https://getemoji.com/" target="_blank">絵文字を探す→</a>',
  isInvalid: (item: Article) => !item?.emoji,
};

const validateMissingTopics: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    'topics（記事に関連する言語や技術）を配列で指定してください。例）["react", "javascript"]',
  isInvalid: (item: Article | Book) =>
    !item.topics?.length || !Array.isArray(item.topics),
};

const validateTooManyTopis: ItemValidator = {
  isCritical: true,
  getMessage: () => "topicsは最大5つまで指定できます",
  isInvalid: (item: Article | Book) =>
    Array.isArray(item.topics) && item.topics.length > 5,
};

const validateInvalidTopicLetters: ItemValidator = {
  getMessage: () =>
    "topicsに記号やスペースを使用することはできません。例えばC++は「cpp」、C#は「csharp」と記載してください",
  isInvalid: (item: Article | Book) =>
    Array.isArray(item.topics) &&
    !!item.topics.find((t) => {
      if (typeof t !== "string") return true;
      return t.match(/[ -/:-@[-`{-~]/g);
    }),
};

const validateUseTags: ItemValidator = {
  getMessage: () => "tagではなくtopicsを使ってください",
  isInvalid: (item: any) => item.tags?.length,
};

const validateBookSummary: ItemValidator = {
  isCritical: true,
  getMessage: () => "summary（本の説明）の記載は必須です",
  isInvalid: (item: Book) => !item.summary?.length,
};

const validateBookPriceType: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    'price（本の価格）は文字列ではなく数字で指定してください（"で囲まないでください）',
  isInvalid: (item: Book) => typeof item.price !== "number",
};

const validateBookPriceRange: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    "price（本の価格）を有料にする場合、200〜5000の間で指定してください",
  isInvalid: (item: Book) =>
    item.price && item.price !== 0 && (item.price > 5000 || item.price < 200),
};

const validateBookPriceFraction: ItemValidator = {
  isCritical: true,
  getMessage: () => "price（本の価格）は100円単位で指定してください",
  isInvalid: (item: Book) => item.price && item.price % 100 !== 0,
};

const validateMissingBookCover: ItemValidator = {
  getMessage: (item: Book) =>
    `本のカバー画像（cover.pngもしくはcover.jpg）を「/books/${escapeHtml(
      item.slug
    )}」ディレクトリ内に配置してください`,
  isInvalid: (item: Book) => !item.coverDataUrl,
};

const validateChapterItemSlug: ItemValidator = {
  isCritical: true,
  getMessage: (item: Chapter) => getChapterSlugErrorMessage(item.slug),
  isInvalid: (item: Chapter) => !validateChapterSlug(item.slug),
};

const validateDeprecatedChapterSlug: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    `1.md、2.md、3.md … のようなチャプターファイルの作成方法は非推奨となりました。<br/><a href="https://zenn.dev/zenn/articles/deprecated-book-deployment" target="_blank">詳しくはこちら</a>`,
  isInvalid: (item: Chapter) => /^[0-9]{1,2}$/.test(item.slug),
};

const getErrors = (item: Item, validators: ItemValidator[]): ErrorMessages => {
  const messages: ErrorMessages = [];
  validators.forEach((validator) => {
    if (validator.isInvalid(item)) {
      const errorMessage: ErrorMessage = {
        isCritical: !!validator.isCritical,
        message: validator.getMessage(item),
      };
      messages.push(errorMessage);
    }
  });
  return messages;
};

export const getArticleErrors = (article: Article): ErrorMessages => {
  const validators = [
    validateItemSlug,
    validateMissingTitle,
    validateTitleLength,
    validateArticleType,
    validateEmojiFormat,
    validateMissingEmoji,
    validateMissingTopics,
    validateUseTags,
    validateInvalidTopicLetters,
    validateTooManyTopis,
  ];
  return getErrors(article, validators);
};

export const getBookErrors = (book: Book): ErrorMessages => {
  const validators = [
    validateItemSlug,
    validateMissingTitle,
    validateTitleLength,
    validateMissingTopics,
    validateUseTags,
    validateInvalidTopicLetters,
    validateTooManyTopis,
    validateBookSummary,
    validateBookPriceType,
    validateBookPriceRange,
    validateBookPriceFraction,
    validateMissingBookCover,
  ];
  return getErrors(book, validators);
};

export const getChapterErrors = (chapter: Chapter): ErrorMessages => {
  const validators = [
    validateChapterItemSlug,
    validateDeprecatedChapterSlug,
    validateMissingTitle,
    validateTitleLength,
  ];
  return getErrors(chapter, validators);
};
