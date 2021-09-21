import path from 'path';
import { exec } from '../../commands/init';
import * as helper from '../../lib/helper';
import { initHelpText } from '../../lib/messages';

describe('cli exec init', () => {
  beforeEach(() => {
    // mock
    jest.spyOn(helper, 'generateFileIfNotExist').mockImplementation();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  test('should call generateFileIfNotExist for directories', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), 'articles/.keep')),
      expect.stringMatching(/^$/)
    );
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), 'books/.keep')),
      expect.stringMatching(/^$/)
    );
  });

  test('should call generateFileIfNotExist for .gitignore', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), '.gitignore')),
      expect.stringContaining(['node_modules', '.DS_Store'].join('\n'))
    );
  });

  test('should call generateFileIfNotExist for README', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), 'README.md')),
      expect.stringContaining('Zenn CLI')
    );
  });

  test('should log success message', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('🎉  Done!')
    );
  });

  test('should log help text with --help', () => {
    exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(initHelpText)
    );
  });
});
