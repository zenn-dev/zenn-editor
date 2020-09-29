import escapeHtml from "escape-html";

import {
  Item,
  Article,
  Book,
  Chapter,
  ItemValidator,
  ErrorMessages,
  ErrorMessage,
} from "@types";

import { validateSlug, getSlugErrorMessage } from "@utils/shared/slug-helper";

const validateInvalidSlug: ItemValidator = {
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
  getMessage: () => "使用できない絵文字（emoji）が指定されています",
  isInvalid: (item: Article) => {
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    return item.emoji && !item.emoji.match(emojiRegex);
  },
};

const validateMissingEmoji: ItemValidator = {
  getMessage: () =>
    'アイキャッチとなるemoji（絵文字）を指定してください<br/><a href="https://getemoji.com/" target="_blank">絵文字を探す→</a>',
  isInvalid: (item: Article) => !item.emoji,
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

const validateChapterFormat: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    "各チャプターのファイル名は0から始めることはできません。1.mdのように1〜50の数字にしてください",
  isInvalid: (item: Chapter) => {
    return !!item.position.match(/^0/);
  },
};

const validateChapterPosition: ItemValidator = {
  isCritical: true,
  getMessage: () =>
    "各チャプターのファイル名は「1.md」のように「1〜50の半角数字.md」としてください",
  isInvalid: (item: Chapter) => {
    const positionNum = Number(item.position);
    return Number.isNaN(positionNum) || positionNum < 1 || positionNum > 50;
  },
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
    validateInvalidSlug,
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
    validateInvalidSlug,
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
    validateChapterPosition,
    validateChapterFormat,
    validateMissingTitle,
    validateTitleLength,
  ];
  return getErrors(chapter, validators);
};
