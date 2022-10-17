import { Dect, ItemValidator, ValidationError } from './types';
import {
  validateArticleType,
  validateBookChaptersFormat,
  validateBookChapterSlugs,
  validateBookCoverAspectRatio,
  validateBookCoverSize,
  validateBookPriceFraction,
  validateBookPriceRange,
  validateBookPriceType,
  validateBookSummary,
  validateChapterFreeType,
  validateChapterItemSlug,
  validateEmojiFormat,
  validateInvalidTopicLetters,
  validateItemSlug,
  validateMissingBookCover,
  validateMissingEmoji,
  validateMissingTitle,
  validatePublicationName,
  validateMissingTopics,
  validatePublishedAtParse,
  validatePublishedAtSchedule,
  validatePublishedStatus,
  validateTitleLength,
  validateTooManyTopics,
  validateTopicType,
  validateUseTags,
} from './utils';

function getValidationErrors(
  item: any,
  validators: ItemValidator[]
): ValidationError[] {
  return validators.reduce((errors: ValidationError[], validator) => {
    if (!validator.isValid(item)) {
      errors.push({
        type: validator.type,
        isCritical: validator.isCritical === true,
        message: validator.getMessage(item),
        detailUrl: validator.detailUrl,
        detailUrlText: validator.detailUrlText,
      });
    }
    return errors;
  }, []);
}

/**
 * 記事情報を検証する
 */
export const validateArticle = (article: Dect): ValidationError[] => {
  const validators = [
    validateItemSlug,
    validateMissingTitle,
    validateTitleLength,
    validatePublishedStatus,
    validatePublishedAtParse,
    validatePublishedAtSchedule,
    validateArticleType,
    validateEmojiFormat,
    validateMissingEmoji,
    validateMissingTopics,
    validateUseTags,
    validateInvalidTopicLetters,
    validateTooManyTopics,
    validateTopicType,
    validatePublicationName,
  ];
  return getValidationErrors(article, validators);
};

/**
 * 本情報を検証する
 */
export const validateBook = (book: Dect): ValidationError[] => {
  const validators = [
    validateItemSlug,
    validateMissingTitle,
    validateTitleLength,
    validatePublishedStatus,
    validateMissingTopics,
    validateUseTags,
    validateInvalidTopicLetters,
    validateTooManyTopics,
    validateTopicType,
    validateBookSummary,
    validateBookPriceType,
    validateBookPriceRange,
    validateBookPriceFraction,
    validateMissingBookCover,
    validateBookCoverSize,
    validateBookCoverAspectRatio,
    validateBookChapterSlugs,
    validateBookChaptersFormat,
  ];
  return getValidationErrors(book, validators);
};

/**
 * 本のチャプター情報を検証する
 */
export const validateBookChapter = (chapter: Dect): ValidationError[] => {
  const validators = [
    validateChapterItemSlug,
    validateMissingTitle,
    validateTitleLength,
    validateChapterFreeType,
  ];
  return getValidationErrors(chapter, validators);
};

export type { ValidationError };
