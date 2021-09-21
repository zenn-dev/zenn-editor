import { exec } from '../../commands/help';
import { commandListText } from '../../lib/messages';

describe('cli exec help', () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  test('should log help message', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(commandListText)
    );
  });
});
