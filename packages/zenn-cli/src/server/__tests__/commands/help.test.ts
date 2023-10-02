import { vi, describe, test, expect, beforeEach } from 'vitest';
import { exec } from '../../commands/help';
import { commandListText } from '../../lib/messages';

describe('helpコマンドのテスト', () => {
  beforeEach(() => {
    console.log = vi.fn();
  });

  test('ヘルプメッセージを表示する', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(commandListText)
    );
  });
});
