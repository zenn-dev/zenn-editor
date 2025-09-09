import { ItemSortType } from './types';

export function validateSlug(slug: string) {
  if (!slug) return false;
  return /^[0-9a-z\-_]{12,50}$/.test(slug);
}

export function getSlugErrorMessage(slug: string) {
  return `slugの値（${slug}）が不正です。小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の12〜50字の組み合わせにしてください`;
}

export function validateChapterSlug(slug: string) {
  if (!slug) return false;
  // n.slug.mdも許容
  return (
    /^[0-9a-z\-_]{1,50}$/.test(slug) || /^[0-9]+.[0-9a-z\-_]{1,50}$/.test(slug)
  );
}

export function getChapterSlugErrorMessage(slug: string) {
  return `チャプターのslugの値（${slug}）が不正です。小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の1〜50字の組み合わせにしてください`;
}

export const itemSortTypes = ['modified', 'system'] as const;

export function getValidSortTypes(value: unknown): ItemSortType {
  const isValid = itemSortTypes.some((t) => t === value);
  if (isValid) return value as ItemSortType;

  const defaultType = itemSortTypes[0];
  return defaultType;
}
