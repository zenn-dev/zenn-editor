import * as helper from '../helper';

describe('validateSlug', () => {
  test('should return true with 12 valid characters', () => {
    const result = helper.validateSlug('abcd-efg_123');
    expect(result).toBe(true);
  });

  test('should return false with 12 invalid characters', () => {
    expect(helper.validateSlug('abcd-efg%12')).toBe(false);
    expect(helper.validateSlug('abcd-efg/12')).toBe(false);
    expect(helper.validateSlug('abcd-efg"12')).toBe(false);
  });

  test('should return false with 11 valid characters', () => {
    const result = helper.validateSlug('abcd-efg_12');
    expect(result).toBe(false);
  });

  test('should return false with 50 valid characters', () => {
    const result = helper.validateSlug(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx'
    );
    expect(result).toBe(true);
  });

  test('should return false with 51 valid characters', () => {
    const result = helper.validateSlug(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
    );
    expect(result).toBe(false);
  });
});

describe('validateChapterSlug', () => {
  test('should return true with 12 valid characters', () => {
    const result = helper.validateSlug('abcd-efg_123');
    expect(result).toBe(true);
  });

  test('should return false with single valid character', () => {
    const result = helper.validateSlug('a');
    expect(result).toBe(false);
  });

  test('should return false with 51 valid characters', () => {
    const result = helper.validateSlug(
      'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxy'
    );
    expect(result).toBe(false);
  });
});
