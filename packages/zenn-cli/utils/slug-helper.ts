import escapeHtml from 'escape-html';
const cryptoRandomString = require('crypto-random-string');

export const generateSlug = (): string => {
  return cryptoRandomString({ length: 20, type: 'hex' });
};

export const validateSlug = (slug: string): boolean => {
  return !!(slug && slug.match(/^[0-9a-z\-_]{12,50}$/));
};

export const getSlugErrorMessage = (slug: string) =>
  `slugの値（${escapeHtml(
    slug
  )}）が不正です。小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の12〜50字の組み合わせにしてください`;

export const validateChapterSlug = (slug: string): boolean => {
  if (!slug) return false;

  return !!slug.match(/^[0-9a-z\-_]{1,50}$/);
};

export const getChapterSlugErrorMessage = (slug: string) =>
  `チャプターのslugの値（${escapeHtml(
    slug
  )}）が不正です。小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の1〜50字の組み合わせにしてください`;
