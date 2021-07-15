import { validateHtml } from '../../lib/validator';

describe('validateHtml', () => {
  test('If src is a URL, validation succeeds.', () => {
    const errors = validateHtml(
      '<img src="https://example.com/images/example.png" />'
    );
    expect(errors).toHaveLength(0);
  });

  test('If src is a valid path, validation succeeds.', () => {
    const errors = validateHtml('<img src="/images/example.png" />');
    expect(errors).toHaveLength(0);
  });

  test('If src is a invalid path, validation fails.', () => {
    const errors = validateHtml('<img src="../images/example.png" />');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('不正な画像のパスが検出されました');
    expect(errors[0].isCritical).toBeTruthy;
  });

  test('If src is a path with invalid extension, validation fails.', () => {
    const errors = validateHtml('<img src="/images/example.svg" />');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('非対応の拡張子の画像が検出されました');
    expect(errors[0].isCritical).toBeTruthy;
  });
});
