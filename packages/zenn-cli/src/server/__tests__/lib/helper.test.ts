import path from 'path';
import fs from 'fs-extra';
import * as helper from '../../lib/helper';
import * as Log from '../../lib/log';
import { validateSlug } from '../../../common/helper';

const fixtureDirPath = path.resolve(__dirname, '..', 'fixtures');

describe('generateSlug', () => {
  test('should return valid slug', () => {
    const str = helper.generateSlug();
    const result = validateSlug(str);
    expect(result).toBe(true);
  });
});

describe('getCurrentCliVersion', () => {
  test('should return version number', () => {
    const str = helper.getCurrentCliVersion();
    expect(str).toMatch(/^0\.[0-9.]+/);
  });
});

describe('getWorkingPath', () => {
  beforeEach(() => {
    // mock
    jest.spyOn(process, 'cwd').mockReturnValue('foo');
    jest.spyOn(process, 'exit').mockImplementation();
    jest.spyOn(Log, 'error').mockImplementation();
  });

  test('should return joined path properly', () => {
    expect(helper.getWorkingPath('bar')).toEqual('foo/bar');
    expect(helper.getWorkingPath('/bar')).toEqual('foo/bar');
  });

  test('should exit if ../ is included to prevent directory traversal', () => {
    helper.getWorkingPath('../foo');
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(Log.error).toHaveBeenCalledWith(
      expect.stringContaining(`不正な文字列が含まれているため処理を終了します`)
    );
  });
});

describe('getFileRaw', () => {
  test('should return file content with valid path to file', () => {
    const result = helper.getFileRaw(`${fixtureDirPath}/markdown-body-only.md`);
    expect(result).toContain(`# Hello\n\nHola!`);
  });
  test('should return null with invalid path', () => {
    const result = helper.getFileRaw('invalid-path');
    expect(result).toBe(null);
  });
});

describe('getImageRaw', () => {
  test('should return file binary with valid path to image', () => {
    const result = helper.getFileRaw(`${fixtureDirPath}/images/test.jpg`);
    expect(result?.length).toBeGreaterThanOrEqual(500);
  });
  test('should return null with invalid path', () => {
    const result = helper.getFileRaw('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listDirnames', () => {
  test('should return dir names in the dir', () => {
    const result = helper.listDirnames(`${fixtureDirPath}/books`);
    expect(result).toEqual(['my-first-book', 'my-second-book']);
  });
  test('should return null with invalid path', () => {
    const result = helper.listDirnames('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listFilenames', () => {
  test('should return file names in the dir ', () => {
    const result = helper.listFilenames(`${fixtureDirPath}/articles`);
    // use sort() to ignore array position
    expect(result?.sort()).toEqual(
      ['my-first-post.md', 'my-second-post.md'].sort()
    );
  });
  test('should return null with invalid path', () => {
    const result = helper.listFilenames('invalid-path');
    expect(result).toBe(null);
  });
});

describe('listFilenamesOrderByModified', () => {
  function touchFile(articleFilename: string) {
    const fullpath = path.join(fixtureDirPath, `articles/${articleFilename}`);
    const currentTime = new Date().getTime() / 1000; // The value should be a Unix timestamp in seconds. For example, Date.now() returns milliseconds, so it should be divided by 1000 before passing it in.
    fs.utimesSync(fullpath, currentTime, currentTime);
  }

  test('should return file names order by modified time', () => {
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

  test('should return null with invalid path', () => {
    const result = helper.listFilenamesOrderByModified('invalid-path');
    expect(result).toBe(null);
  });
});

describe('getImageSize', () => {
  const result = helper.getImageSize(
    `${fixtureDirPath}/images/test-1036bytes.jpg`
  );
  expect(result).toEqual(1036);
});

describe('generateFileIfNotExist', () => {
  const tempFilepath = path.join(process.cwd(), '.temp/test/example.md');
  afterEach(() => {
    // clean up
    fs.rmSync(tempFilepath, {
      force: true,
    });
  });

  test('should generate file with specified body', () => {
    const body = 'Hello!';
    helper.generateFileIfNotExist(tempFilepath, body);
    const result = fs.readFileSync(tempFilepath, 'utf8');
    expect(result).toEqual(body);
  });

  test('should not overwrite if already exists', () => {
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

describe('completeHtml', () => {
  beforeEach(() => {
    // process.cwdがfixturesディレクトリを指すようにする
    jest.spyOn(process, 'cwd').mockReturnValue(fixtureDirPath);
  });

  test('If src is a URL, validation succeeds.', () => {
    const html = helper.completeHtml(
      '<img src="https://example.com/images/example.png">'
    );
    expect(html).not.toContain('表示できません');
  });

  test('If src is a valid path, validation succeeds.', () => {
    const html = helper.completeHtml('<img src="/images/test.jpg">'); // fixtures/images/test.jpgを参照
    expect(html).not.toContain('表示できません');
  });

  test('If src is pointing nonexistent image, validation fails.', () => {
    const html = helper.completeHtml('<img src="/images/notexist.jpg">'); // fixtures/images/notexist.jpgを参照
    expect(html).toContain('ファイルが存在しません');
  });

  test('If src is a invalid path, validation fails.', () => {
    const html = helper.completeHtml('<img src="../images/example.png">');
    expect(html).toContain('表示できません');
  });

  test('If src is a path with invalid extension, validation fails.', () => {
    const html = helper.completeHtml('<img src="/images/example.svg">');
    expect(html).toContain('表示できません');
  });
});
