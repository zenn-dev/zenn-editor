import path from 'path';
import { exec } from '../../commands/new-book';
import * as helper from '../../lib/helper';
import * as Log from '../../lib/log';
import { newBookHelpText } from '../../lib/messages';

describe('new:book コマンドのテスト', () => {
  const expectedBooksDirpath = path.join(process.cwd(), 'books');
  const anyConfigYamlPathRegex = new RegExp(
    `${expectedBooksDirpath}/[a-zA-Z0-9-_]+/config.yaml`
  );
  const anyChapterFileRegex = new RegExp(
    `${expectedBooksDirpath}/[a-zA-Z0-9-_]+/[a-zA-Z0-9-_]+.md`
  );

  beforeEach(() => {
    // mock
    jest.spyOn(helper, 'generateFileIfNotExist').mockImplementation();
    jest.spyOn(Log, 'error').mockImplementation();
    console.log = jest.fn();
  });

  test('config.yaml のデフォルト値で generateFileIfNotExist を実行する', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(anyConfigYamlPathRegex),
      expect.stringContaining(
        [
          `title: ""`,
          `summary: ""`,
          'topics: []',
          `published: false`,
          `price: 0 # 有料の場合200〜5000`,
          `# 本に含めるチャプターを順番に並べましょう`,
          `chapters:`,
          `  - example1`,
          `  - example2`,
        ].join('\n')
      )
    );
  });

  test('チャプターの初期値で generateFileIfNotExist を２回実行する', () => {
    const expectedChapterBody = [`---`, `title: ""`, `---`].join('\n');
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(anyChapterFileRegex),
      expect.stringContaining(expectedChapterBody)
    );
    expect(helper.generateFileIfNotExist).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(anyChapterFileRegex),
      expect.stringContaining(expectedChapterBody)
    );
  });

  test('指定した slug を含むパスで generateFileIfNotExist を実装する', () => {
    const slug = 'example-book';
    exec(['--slug', slug]);

    const expectedBookDirpath = `${expectedBooksDirpath}/${slug}`;

    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(`${expectedBookDirpath}/config.yaml`),
      expect.anything()
    );
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(`${expectedBookDirpath}/example1.md`),
      expect.anything()
    );
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(`${expectedBookDirpath}/example2.md`),
      expect.anything()
    );
  });

  test('指定したタイトル文字列と config.yaml のパスで generateFileIfNotExist を実行する', () => {
    exec(['--title', 'A"B/C']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(anyConfigYamlPathRegex),
      expect.stringContaining(`title: "A\\"B/C"`)
    );
  });

  test('`published: true` と config.yaml のパスで generateFileIfNotExist を実行する', () => {
    exec(['--published', 'true']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(anyConfigYamlPathRegex),
      expect.stringContaining(`published: true`)
    );
  });

  test('`published: false` と config.yaml のパスで generateFileIfNotExist を実行する', () => {
    exec(['--published', 'false']);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringMatching(anyConfigYamlPathRegex),
      expect.stringContaining(`published: false`)
    );
  });

  test('--help オプションを渡すとヘルプメッセージを表示する', () => {
    exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(newBookHelpText)
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
