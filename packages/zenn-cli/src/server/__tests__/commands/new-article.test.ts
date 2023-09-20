import path from 'path';
import { exec } from '../../commands/new-article';
import * as helper from '../../lib/helper';
import * as Log from '../../lib/log';
import { newArticleHelpText } from '../../lib/messages';

describe('new:articleコマンドのテスト', () => {
  const expectedArticlesDirpath = path.join(process.cwd(), 'articles');

  beforeEach(() => {
    // mock
    jest.spyOn(helper, 'generateFileIfNotExist').mockImplementation();
    jest.spyOn(Log, 'error').mockImplementation();
    console.log = jest.fn();
  });

  test('有効な引数に generateFileIfNotExist を実行する', () => {
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

  test('指定されたタイトルで generateFileIfNotExist を実行する', () => {
    exec(['--title', 'A"B/C']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`title: "A\\"B/C"`)
    );
  });

  test('`published: true` で generateFileIfNotExist を実行する', () => {
    exec(['--published', 'true']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`published: true`)
    );
  });

  test('`published: false` で generateFileIfNotExist を実行する', () => {
    exec(['--published', 'false']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`published: false`)
    );
  });

  test('指定した slug を含むパスで generateFileIfNotExist を実行する', () => {
    const slug = 'example-article';
    exec(['--slug', slug]);

    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(`${expectedArticlesDirpath}/${slug}.md`),
      expect.stringContaining(`---`)
    );
  });

  test('指定された Publication 名で generateFileIfNotExist を実行する', () => {
    exec(['--publication-name', 'myPublication']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(expectedArticlesDirpath),
      expect.stringContaining(`publication_name: myPublication`)
    );
  });

  test('--help オプションを渡すとヘルプメッセージを表示する', () => {
    exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(newArticleHelpText)
    );
  });

  test('無効な slug が渡されたらエラーメッセージを表示する', () => {
    exec(['--slug', 'invalid/slug']);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `小文字の半角英数字（a-z0-9）、ハイフン（-）、アンダースコア（_）の12〜50字の組み合わせにしてください`
      )
    );
  });
});
