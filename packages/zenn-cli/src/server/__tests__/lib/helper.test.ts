import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
vi.mock('package-manager-detector/detect', () => ({ detect: vi.fn() }));
vi.mock('package-manager-detector/commands', () => ({
  resolveCommand: vi.fn(),
}));
import { detect as detectPackageManager } from 'package-manager-detector/detect';
import { resolveCommand } from 'package-manager-detector/commands';
import path from 'path';
import fs from 'fs-extra';
import * as helper from '../../lib/helper';
import * as Log from '../../lib/log';
import { validateSlug } from '../../../common/helper';

const fixtureDirPath = path.resolve(__dirname, '..', 'fixtures');

describe('generateSlug() のテスト', () => {
  test('有効な slug を返す', () => {
    const str = helper.generateSlug();
    const result = validateSlug(str);
    expect(result).toBe(true);
  });
});

describe('getCurrentCliVersion() のテスト', () => {
  test('バージョン番号を返す', () => {
    const str = helper.getCurrentCliVersion();
    expect(str).toMatch(/^0\.[0-9.]+/);
  });
});

describe('getWorkingPath() のテスト', () => {
  beforeEach(() => {
    // mock
    vi.spyOn(process, 'cwd').mockReturnValue('foo');
    vi.spyOn(process, 'exit').mockReturnValue(undefined as never);
    vi.spyOn(Log, 'error').mockReturnValue(undefined);
  });

  test('結合されたパスを返す', () => {
    expect(helper.getWorkingPath('bar')).toEqual('foo/bar');
    expect(helper.getWorkingPath('/bar')).toEqual('foo/bar');
  });

  test('ディレクトリトラバーサルを防ぐために "../" が含まれている場合はエラーを出す', () => {
    helper.getWorkingPath('../foo');
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining(`不正な文字列が含まれているため処理を終了します`)
    );
  });
});

describe('getFileRaw() のテスト', () => {
  test('有効なパスの場合はファイル内容を返す', () => {
    const result = helper.getFileRaw(`${fixtureDirPath}/markdown-body-only.md`);
    expect(result).toContain(`# Hello\n\nHola!`);
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.getFileRaw('invalid-path');
    expect(result).toBe(null);
  });
});

describe('getImageRaw() のテスト', () => {
  test('有効なパスの場合は画像のバイナリデータを返す', () => {
    const result = helper.getFileRaw(`${fixtureDirPath}/images/test.jpg`);
    expect(result?.length).toBeGreaterThanOrEqual(500);
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.getFileRaw('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listDirnames() のテスト', () => {
  test('有効なパスの場合はディレクトリ名の配列を返す', () => {
    const result = helper.listDirnames(`${fixtureDirPath}/books`);
    expect(result).toEqual(['my-first-book', 'my-second-book']);
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.listDirnames('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listFilenames() のテスト', () => {
  test('指定したディレクトリ内のファイル名の配列を返す', () => {
    const result = helper.listFilenames(`${fixtureDirPath}/articles`);
    // use sort() to ignore array position
    expect(result?.sort()).toEqual(
      ['my-first-post.md', 'my-second-post.md'].sort()
    );
  });
  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.listFilenames('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listFilenamesOrderByModified() のテスト', () => {
  function touchFile(articleFilename: string) {
    const fullpath = path.join(fixtureDirPath, `articles/${articleFilename}`);
    const currentTime = new Date().getTime() / 1000; // The value should be a Unix timestamp in seconds. For example, Date.now() returns milliseconds, so it should be divided by 1000 before passing it in.
    fs.utimesSync(fullpath, currentTime, currentTime);
  }

  test('変更時刻順にファイル名を返す', () => {
    // update my-second-post.md mtime
    touchFile('my-second-post.md');
    expect(
      helper.listFilenamesOrderByModified(`${fixtureDirPath}/articles`)
    ).toEqual(['my-second-post.md', 'my-first-post.md']);
    // touch my-first-post.md metime
    touchFile('my-first-post.md');
    expect(
      helper.listFilenamesOrderByModified(`${fixtureDirPath}/articles`)
    ).toEqual(['my-first-post.md', 'my-second-post.md']);
  });

  test('無効なパスの場合は `null` を返す', () => {
    const result = helper.listFilenamesOrderByModified('invalid-path');
    expect(result).toBe(null);
  });
});

describe('getImageSize() のテスト', () => {
  test('指定した画像のサイズ', () => {
    const result = helper.getImageSize(
      `${fixtureDirPath}/images/test-1036bytes.jpg`
    );
    expect(result).toEqual(1036);
  });
});

describe('generateFileIfNotExist() のテスト', () => {
  const tempFilepath = path.join(process.cwd(), '.temp/test/example.md');
  afterEach(() => {
    // clean up
    fs.rmSync(tempFilepath, {
      force: true,
    });
  });

  test('指定された本文を持つファイルを生成する', () => {
    const body = 'Hello!';
    helper.generateFileIfNotExist(tempFilepath, body);
    const result = fs.readFileSync(tempFilepath, 'utf8');
    expect(result).toEqual(body);
  });

  test('既に存在するファイルを上書きしない', () => {
    helper.generateFileIfNotExist(tempFilepath, 'Hello!');
    // trying to write same file should throw error
    expect(() =>
      helper.generateFileIfNotExist(tempFilepath, 'Updated!')
    ).toThrow(/EEXIST: file already exists/);
    // body shouldn't have been changed
    const result = fs.readFileSync(tempFilepath, 'utf8');
    expect(result).toEqual('Hello!');
  });
});

describe('completeHtml() のテスト', () => {
  beforeEach(() => {
    // process.cwdがfixturesディレクトリを指すようにする
    vi.spyOn(process, 'cwd').mockReturnValue(fixtureDirPath);
  });

  test('src の値が URL なら検証に成功する', () => {
    const html = helper.completeHtml(
      '<img src="https://example.com/images/example.png">'
    );
    expect(html).not.toContain('表示できません');
  });

  test('src の値が有効なパスなら検証に成功する', () => {
    const html = helper.completeHtml('<img src="/images/test.jpg">'); // fixtures/images/test.jpgを参照
    expect(html).not.toContain('表示できません');
  });

  test('src に%20（スペースのURLエンコード）が含まれるパスでも正しく処理される', () => {
    const imagePathWithSpace = path.join(
      fixtureDirPath,
      'images',
      'test image.jpg'
    );
    const originalImagePath = path.join(fixtureDirPath, 'images', 'test.jpg');

    if (fs.existsSync(originalImagePath)) {
      fs.copyFileSync(originalImagePath, imagePathWithSpace);

      const html = helper.completeHtml('<img src="/images/test%20image.jpg">');

      expect(html).not.toContain('ファイルが存在しません');
      expect(html).not.toContain('表示できません');

      // clean up
      fs.unlinkSync(imagePathWithSpace);
    }
  });

  test('src に指定された画像がなければ "ファイルが存在しません" を出力する', () => {
    const html = helper.completeHtml('<img src="/images/notexist.jpg">'); // fixtures/images/notexist.jpgを参照
    expect(html).toContain('ファイルが存在しません');
  });

  test('src の値が無効なパスなら "表示できません" を出力する', () => {
    const html = helper.completeHtml('<img src="../images/example.png">');
    expect(html).toContain('表示できません');
  });

  test('src の値が無効な拡張子なら "表示できません" を出力する', () => {
    const html = helper.completeHtml('<img src="/images/example.svg">');
    expect(html).toContain('表示できません');
  });

  test('files ディレクトリの画像も検証する', () => {
    expect(helper.completeHtml('<img src="/files/test.jpg">')).not.toMatch(
      /表示できません|ファイルが存在しません/
    );
    expect(helper.completeHtml('<img src="/files/notexist.jpg">')).toContain(
      'ファイルが存在しません'
    );
    expect(helper.completeHtml('<img src="/files/test.m4a">')).toContain(
      '表示できません'
    );
  });

  describe('音声の検証', () => {
    const audioHtml = (src: string) =>
      `<span class="embed-block embed-audio"><audio controls preload="metadata" src="${src}"></audio></span>`;

    test('src の値が URL なら検証しない', () => {
      const html = helper.completeHtml(
        audioHtml('https://example.com/audio/a.m4a')
      );
      expect(html).toContain('<audio');
      expect(html).not.toContain('data-body-error');
    });

    test('files ディレクトリにある音声は検証に成功する', () => {
      const html = helper.completeHtml(audioHtml('/files/test.m4a'));
      expect(html).toContain('<audio');
      expect(html).not.toContain('data-body-error');
    });

    test('エンコードされた日本語のファイル名でも検証に成功する', () => {
      const filepath = path.join(fixtureDirPath, 'files', '日本語.m4a');
      fs.copyFileSync(path.join(fixtureDirPath, 'files', 'test.m4a'), filepath);
      try {
        const html = helper.completeHtml(
          audioHtml('/files/%E6%97%A5%E6%9C%AC%E8%AA%9E.m4a')
        );
        expect(html).toContain('<audio');
        expect(html).not.toContain('data-body-error');
      } finally {
        fs.unlinkSync(filepath);
      }
    });

    test('音声がなければ "ファイルが存在しません" を出力する', () => {
      const html = helper.completeHtml(audioHtml('/files/notexist.m4a'));
      expect(html).not.toContain('<audio');
      expect(html).toContain('ファイルが存在しません');
    });

    test('640KB を超える音声はエラーを出力する', () => {
      const filepath = path.join(fixtureDirPath, 'files', 'too-large.m4a');
      fs.writeFileSync(filepath, Buffer.alloc(640 * 1024 + 1));
      try {
        const html = helper.completeHtml(audioHtml('/files/too-large.m4a'));
        expect(html).not.toContain('<audio');
        expect(html).toContain('640KB以内');
      } finally {
        fs.unlinkSync(filepath);
      }
    });

    test.each([
      ['files の外を指すパス', '/files/../articles/my-first-post.md'],
      ['エンコードされた遡り', '/files/%2e%2e/articles/my-first-post.md'],
      ['files 以外のディレクトリ', '/images/test.jpg'],
      ['不正なエンコード', '/files/%E6.m4a'],
    ])('%sはエラーを出力する', (_name, src) => {
      const html = helper.completeHtml(audioHtml(src));
      expect(html).not.toContain('<audio');
      expect(html).toContain('パスが不正です');
    });
  });

  test('エラーメッセージに埋め込む src の HTML はエスケープされる', () => {
    const html = helper.completeHtml(
      '<img src="&lt;img src=x onerror=alert(1)&gt;">'
    );
    expect(html).toContain('表示できません');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('onerror=alert(1)>');
    expect(html).not.toMatch(/<img[^>]*onerror/);
  });
});

describe('resolveExecuteCommand() のテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('パッケージマネージャーが検出されコマンドが解決された場合はコマンド文字列を返す', async () => {
    const detectMock = vi.mocked(detectPackageManager);
    const resolveMock = vi.mocked(resolveCommand);
    detectMock.mockResolvedValue({ name: 'bun', agent: 'bun' });
    resolveMock.mockReturnValue({
      command: 'bun',
      args: ['x', 'zenn', 'foo', 'bar'],
    });

    const result = await helper.resolveExecuteCommand(['zenn', 'foo', 'bar']);
    expect(result).toEqual('bun x zenn foo bar');
  });

  test('パッケージマネージャーの検出に失敗した場合は `npm` にフォールバックしてコマンドの解決を試みる', async () => {
    const detectMock = vi.mocked(detectPackageManager);
    const resolveMock = vi.mocked(resolveCommand);
    detectMock.mockResolvedValue(null);
    resolveMock.mockImplementation((agent) => {
      expect(agent).toEqual('npm');
      return {
        command: 'npx',
        args: ['zenn', 'foo', 'bar'],
      };
    });
  });

  test('コマンドの解決に失敗した場合はフォールバックとして `npx` を使用したコマンドを返す', async () => {
    const detectMock = vi.mocked(detectPackageManager);
    const resolveMock = vi.mocked(resolveCommand);
    detectMock.mockResolvedValue({ name: 'npm', agent: 'npm' });
    resolveMock.mockReturnValue(null);

    const result = await helper.resolveExecuteCommand(['zenn', 'foo', 'bar']);
    expect(result).toEqual('npx zenn foo bar');
  });
});

describe('resolveHostname() のテスト', () => {
  test('hostname が未指定の場合は DEFAULT_HOSTNAME を返し、NetWork は表示しない', () => {
    expect(helper.DEFAULT_HOSTNAME).toBe('127.0.0.1');
    expect(helper.resolveHostname()).toEqual({ name: '127.0.0.1' });
  });

  test('hostname が空文字の場合も未指定と同じ扱いにする', () => {
    expect(helper.resolveHostname('')).toEqual({ name: '127.0.0.1' });
  });

  test.each(['0.0.0.0', '::'])(
    'hostname が %s の場合は localhost と LAN の IP アドレスを返す',
    (hostname) => {
      const { name, host } = helper.resolveHostname(hostname);
      expect(name).toBe('localhost');
      expect(host).toBe(helper.getLocalIPAddress());
    }
  );

  test('それ以外の hostname はそのまま返す', () => {
    expect(helper.resolveHostname('192.168.0.10')).toEqual({
      name: '192.168.0.10',
      host: '192.168.0.10',
    });
  });
});
