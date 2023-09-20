import { encodeUrlPeriod, decodeUrlPeriod } from '../../lib/helper';

describe('encodeUrlPeriod と decodeUrlPeriod を使った処理のテスト', () => {
  test('エンコードしてデコードすると元のテキスト"a.b.c"を返す', () => {
    const original = 'a.b.c';
    const encoded = encodeUrlPeriod(original);
    expect(encoded).not.toContain('.');
    const decoded = decodeUrlPeriod(encoded);
    expect(decoded).toEqual(original);
  });
  test('エンコードしてデコードすると元のテキスト"2E."を返す', () => {
    const original = '2E.';
    const encoded = encodeUrlPeriod(original);
    expect(encoded).not.toContain('.');
    const decoded = decodeUrlPeriod(encoded);
    expect(decoded).toEqual(original);
  });
});
