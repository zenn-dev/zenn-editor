import { encodeUrlPeriod, decodeUrlPeriod } from '../../lib/helper';

describe('pair of encodeUrlPeriod and decodeUrlPeriod', () => {
  test('return original text `a.b.c` throgh encoding and decoding', () => {
    const original = 'a.b.c';
    const encoded = encodeUrlPeriod(original);
    expect(encoded).not.toContain('.');
    const decoded = decodeUrlPeriod(encoded);
    expect(decoded).toEqual(original);
  });
  test('return original text `2E.` throgh encoding and decoding', () => {
    const original = '2E.';
    const encoded = encodeUrlPeriod(original);
    expect(encoded).not.toContain('.');
    const decoded = decodeUrlPeriod(encoded);
    expect(decoded).toEqual(original);
  });
});
