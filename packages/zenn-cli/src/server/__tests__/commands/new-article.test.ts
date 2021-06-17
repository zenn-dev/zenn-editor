import path from 'path';
import { exec } from '../../commands/new-article';
import * as helper from '../../lib/helper';
import * as Log from '../../lib/log';
import { newArticleHelpText } from '../../lib/messages';

describe('cli exec new:article', () => {
  const expectedArticlesDirpath = path.join(process.cwd(), 'articles');

  beforeEach(() => {
    // mock
    jest.spyOn(helper, 'generateFileIfNotExist').mockImplementation();
    jest.spyOn(process, 'exit').mockImplementation();
    jest.spyOn(Log, 'error').mockImplementation();
    console.log = jest.fn();
  });

  test('should call generateFileIfNotExist with proper arguments', () => {
    exec(['--emoji', '💭']);

    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(
        [
          `---`,
          `title: ""`,
          `emoji: "💭"`,
          `type: "tech" # tech: 技術記事 / idea: アイデア`,
          `topics: []`,
          `published: false`,
          `---`,
        ].join('\n')
      )
    );
  });

  test('should call generateFileIfNotExist with specified title', () => {
    exec(['--title', 'A"B/C']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`title: "A\\"B/C"`)
    );
  });

  test('should call generateFileIfNotExist with specified published value true', () => {
    exec(['--published', 'true']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`published: true`)
    );
  });

  test('should call generateFileIfNotExist with specified published value false', () => {
    exec(['--published', 'false']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`published: false`)
    );
  });

  test('should call generateFileIfNotExist with the path including slug', () => {
    const slug = 'example-article';
    exec(['--slug', slug]);

    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(`${expectedArticlesDirpath}/${slug}.md`),
      expect.stringContaining(`---`)
    );
  });

  test('should call generateFileIfNotExist with the path including slug', () => {
    const slug = 'example-article';
    exec(['--slug', slug]);

    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(`${expectedArticlesDirpath}/${slug}.md`),
      expect.stringContaining(`---`)
    );
  });

  test('should log help text with --help', () => {
    exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(newArticleHelpText)
    );
  });

  test('should log error with invalid slug', () => {
    exec(['--slug', 'invalid/slug']);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の12〜50字の組み合わせにしてください`
      )
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
