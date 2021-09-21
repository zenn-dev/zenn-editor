import { exec } from '../../commands/version';

describe('cli exec version', () => {
  console.log = jest.fn();
  beforeEach(() => {
    console.log = jest.fn();
  });

  test('should log version', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/^0\.[0-9.]+/)
    );
  });
});
