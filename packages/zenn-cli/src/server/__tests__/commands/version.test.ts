import { exec } from '../../commands/version';

describe('version コマンドのテスト', () => {
  console.log = jest.fn();
  beforeEach(() => {
    console.log = jest.fn();
  });

  test('バージョン情報をコンソールに出力する', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^0\.[0-9.]+/)
    );
  });
});
