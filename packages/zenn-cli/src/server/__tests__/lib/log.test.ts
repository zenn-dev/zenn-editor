import * as Log from '../../lib/log';
import colors from 'colors/safe';

describe('log.error', () => {
  beforeEach(() => {
    // mock
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  test('should log error message', () => {
    Log.error('message');
    expect(console.error).toHaveBeenCalledWith(colors.red('error:'), 'message');
  });

  test('should log warn message', () => {
    Log.warn('message');
    expect(console.warn).toHaveBeenCalledWith(
      colors.yellow('warn:'),
      'message'
    );
  });

  test('should log success message', () => {
    Log.success('message');
    expect(console.log).toHaveBeenCalledWith(
      colors.green('success:'),
      'message'
    );
  });

  test('should log created message', () => {
    Log.created('filename');
    expect(console.log).toHaveBeenCalledWith(
      'created:',
      colors.green('filename')
    );
  });
});
