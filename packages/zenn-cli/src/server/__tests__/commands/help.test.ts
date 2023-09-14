import { exec } from '../../commands/help';
import { commandListText } from '../../lib/messages';

describe('helpコマンドのテスト', () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  test('ヘルプメッセージを表示する', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(commandListText)
    );
  });
});
