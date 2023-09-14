import * as helper from '../helper';

describe('validateSlug() のテスト', () => {
  test('12文字の有効な文字列には true を返す', () => {
    const result = helper.validateSlug('abcd-efg_123');
    expect(result).toBe(true);
  });

  test('12文字の無効な文字列には false を返す', () => {
    expect(helper.validateSlug('abcd-efg%12')).toBe(false);
    expect(helper.validateSlug('abcd-efg/12')).toBe(false);
    expect(helper.validateSlug('abcd-efg"12')).toBe(false);
  });

  test('11文字の有効な文字列には false を返す', () => {
    const result = helper.validateSlug('abcd-efg_12');
    expect(result).toBe(false);
  });

  test('50文字の有効な文字列には false を返す', () => {
    const result = helper.validateSlug(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx'
    );
    expect(result).toBe(true);
  });

  test('51文字の有効な文字列には false を返す', () => {
    const result = helper.validateSlug(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
    );
    expect(result).toBe(false);
  });
});

describe('validateChapterSlug()のテスト', () => {
  test('12文字の有効な文字列には true を返す', () => {
    const result = helper.validateSlug('abcd-efg_123');
    expect(result).toBe(true);
  });

  test('1文字の有効な文字列には false を返す', () => {
    const result = helper.validateSlug('a');
    expect(result).toBe(false);
  });

  test('51文字の有効な文字列には false を返す', () => {
    const result = helper.validateSlug(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
    );
    expect(result).toBe(false);
  });
});
