import {
  Item,
  Article,
  Book,
  Chapter,
  ItemValidator,
  ErrorMessages,
  ErrorMessage,
} from "@types";

const validateInvalidSlug: ItemValidator = {
  errorType: "critical",
  message:
    "slugが不正です。slugは半角英数字（a-z0-9）とハイフン（-）の12〜50字の組み合わせにする必要があります",
  isInvalid: (item: Article | Book) =>
    !(item.slug && item.slug.match(/^[0-9a-z\-\_]{12,50}$/)),
};

const validateMissingTitle: ItemValidator = {
  errorType: "critical",
  message: "title（タイトル）を入力してください",
  isInvalid: (item: Item) => !item.title?.length,
};

const validateArticleType: ItemValidator = {
  errorType: "critical",
  message:
    'type（記事のタイプ）にtechもしくはideaを指定してください。技術記事の場合はtechを指定してください<br/><a href="https://zenn.dev/tech-or-idea" target="_blank">詳細はこちら →</a>',
  isInvalid: (item: Article) => {
    return !item.type || !(item.type === "tech" || item.type === "idea");
  },
};

const validateEmojiFormat: ItemValidator = {
  errorType: "critical",
  message: "不正なemoji（絵文字）が指定されています",
  isInvalid: (item: Article) => {
    const emojiRegex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])$/;
    return item.emoji && !item.emoji.match(emojiRegex);
  },
};

const validateMissingEmoji: ItemValidator = {
  errorType: "notice",
  message:
    'アイキャッチとなるemoji（絵文字）を指定してください<br/><a href="https://getemoji.com/" target="_blank">絵文字を探す→</a>',
  isInvalid: (item: Article) => !item.emoji,
};

const validateMissingTopics: ItemValidator = {
  errorType: "critical",
  message:
    'topics（記事に関連する言語や技術）を配列で指定してください。例）["react", "javascript"]',
  isInvalid: (item: Article | Book) =>
    !item.topics?.length || !Array.isArray(item.topics),
};

const validateTooManyTopis: ItemValidator = {
  errorType: "critical",
  message: "topicsは最大5つまで指定できます",
  isInvalid: (item: Article | Book) =>
    Array.isArray(item.topics) && item.topics.length > 5,
};

const validateInvalidTopicLetters: ItemValidator = {
  errorType: "notice",
  message:
    "topicsに記号やスペースを使用することはできません。例えばC++は「cpp」、C#は「csharp」と記載してください",
  isInvalid: (item: Article | Book) =>
    Array.isArray(item.topics) &&
    !!item.topics.find((t) => t.match(/[ -\/:-@\[-`{-~]/g)),
};

const validateUseTags: ItemValidator = {
  errorType: "notice",
  message: "tagではなくtopicsを使ってください",
  isInvalid: (item: any) => item.tags?.length,
};

const validateBookSummary: ItemValidator = {
  errorType: "critical",
  message: "summary（本の説明）の記載は必須です",
  isInvalid: (item: Book) => !item.summary?.length,
};

const validateBookPriceType: ItemValidator = {
  errorType: "critical",
  message:
    'price（本の価格）は文字列ではなく数字で指定してください（"で囲まないでください）',
  isInvalid: (item: Book) => typeof item.price !== "number",
};

const validateBookPriceRange: ItemValidator = {
  errorType: "critical",
  message:
    "price（本の価格）を有料にする場合、200〜5000の間で指定する必要があります",
  isInvalid: (item: Book) =>
    item.price && item.price !== 0 && (item.price > 5000 || item.price < 200),
};

const validateBookPriceFraction: ItemValidator = {
  errorType: "critical",
  message: "price（本の価格）は100円単位で指定してください",
  isInvalid: (item: Book) => item.price && item.price % 100 !== 0,
};

const validateChapterPosition: ItemValidator = {
  errorType: "critical",
  message:
    "各チャプターのファイル名は「1.md」のように「0〜50の半角数字.md」とする必要があります",
  isInvalid: (item: Chapter) => !item.position.match(/^[0-9]{1,2}$/),
};

export const getArticleErrors = (article: Article): ErrorMessages => {
  let messages: ErrorMessages = [];

  const validators = [
    validateInvalidSlug,
    validateMissingTitle,
    validateArticleType,
    validateEmojiFormat,
    validateMissingEmoji,
    validateMissingTopics,
    validateUseTags,
    validateInvalidTopicLetters,
    validateTooManyTopis,
  ];

  validators.forEach((validator) => {
    if (validator.isInvalid(article)) {
      const { errorType, message } = validator;
      const errorMessage: ErrorMessage = { errorType, message };
      messages.push(errorMessage);
    }
  });

  return messages;
};

export const getBookErrors = (book: Book): ErrorMessages => {
  let messages: ErrorMessages = [];

  const validators = [
    validateInvalidSlug,
    validateMissingTitle,
    validateMissingTopics,
    validateUseTags,
    validateInvalidTopicLetters,
    validateTooManyTopis,
    validateBookSummary,
    validateBookPriceType,
    validateBookPriceRange,
    validateBookPriceFraction,
  ];

  validators.forEach((validator) => {
    if (validator.isInvalid(book)) {
      const { errorType, message } = validator;
      const errorMessage: ErrorMessage = { errorType, message };
      messages.push(errorMessage);
    }
  });

  return messages;
};

export const getChapterErrors = (chapter: Chapter): ErrorMessages => {
  let messages: ErrorMessages = [];
  const validators = [validateChapterPosition, validateMissingTitle];

  validators.forEach((validator) => {
    if (validator.isInvalid(chapter)) {
      const { errorType, message } = validator;
      const errorMessage: ErrorMessage = { errorType, message };
      messages.push(errorMessage);
    }
  });

  return messages;
};
