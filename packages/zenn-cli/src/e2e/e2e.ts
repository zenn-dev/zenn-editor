import { mkdtemp, rm, access } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { describe, it, expect, afterEach } from 'vitest';
import { execZennCommand, logIfFailed } from './helper';

describe('E2E Tests', () => {
  let tmpDir: string | null = null;

  afterEach(async () => {
    // クリーンアップ: 一時ディレクトリを削除
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
      tmpDir = null;
    }
  });

  /**
   * initコマンドのE2Eテスト
   * - 一時ディレクトリを作成
   * - zenn init コマンドを実行
   * - エラーなく完了することを確認
   * - 生成されたファイル/ディレクトリの存在を確認
   */
  it('should execute zenn init command successfully', async () => {
    // 一時ディレクトリを作成
    tmpDir = await mkdtemp(join(tmpdir(), 'zenn-init-test-'));

    // zenn init コマンドを実行
    const result = await execZennCommand(['init'], tmpDir);
    logIfFailed(result);
    expect(result.code).toBe(0);

    // 生成されたファイル/ディレクトリの存在確認
    const expectedPaths = [
      join(tmpDir, 'articles', '.keep'),
      join(tmpDir, 'books', '.keep'),
      join(tmpDir, '.gitignore'),
      join(tmpDir, 'README.md'),
    ];

    for (const path of expectedPaths) {
      await expect(access(path)).resolves.toBeUndefined();
    }
  });

  it('should execute zenn new:article command successfully', async () => {
    // 一時ディレクトリを作成
    tmpDir = await mkdtemp(join(tmpdir(), 'zenn-new-article-test-'));

    // まず init を実行
    const initResult = await execZennCommand(['init'], tmpDir);
    expect(initResult.code).toBe(0);

    // zenn new:article コマンドを実行（デフォルトのslugで）
    const result = await execZennCommand(['new:article'], tmpDir);
    logIfFailed(result);
    expect(result.code).toBe(0);

    // 作成されたファイルを検証
    // stdout から作成されたファイルパスを抽出
    const createdFilePath = result.stdout.match(/articles\/(.+\.md)/)?.[0];
    expect(createdFilePath).toBeTruthy();

    if (createdFilePath) {
      const fullPath = join(tmpDir, createdFilePath);
      await expect(access(fullPath)).resolves.toBeUndefined();
    }
  });

  /**
   * new:bookコマンドのE2Eテスト
   * - 一時ディレクトリを作成し初期化
   * - zenn new:book コマンドを実行
   * - エラーなく完了することを確認
   * - 生成された本のディレクトリとファイルの存在を確認
   */
  it('should execute zenn new:book command successfully', async () => {
    // 一時ディレクトリを作成
    tmpDir = await mkdtemp(join(tmpdir(), 'zenn-new-book-test-'));

    // まず init を実行
    const initResult = await execZennCommand(['init'], tmpDir);
    expect(initResult.code).toBe(0);

    // zenn new:book コマンドを実行（デフォルトのslugで）
    const result = await execZennCommand(['new:book'], tmpDir);
    logIfFailed(result);
    expect(result.code).toBe(0);

    // 作成されたディレクトリとファイルを検証
    // stdout から作成されたファイルパスを抽出
    const configPath = result.stdout.match(/books\/(.+)\/config\.yaml/)?.[0];
    expect(configPath).toBeTruthy();

    if (configPath) {
      const bookSlug = configPath.match(/books\/(.+)\/config\.yaml/)?.[1];
      expect(bookSlug).toBeTruthy();

      if (bookSlug) {
        const bookDir = join(tmpDir, 'books', bookSlug);

        // ファイルの存在確認
        const configFullPath = join(bookDir, 'config.yaml');
        const chapter1Path = join(bookDir, 'example1.md');
        const chapter2Path = join(bookDir, 'example2.md');

        await expect(access(configFullPath)).resolves.toBeUndefined();
        await expect(access(chapter1Path)).resolves.toBeUndefined();
        await expect(access(chapter2Path)).resolves.toBeUndefined();
      }
    }
  });

  it('list:articles コマンドが正常に実行される', async () => {
    // 一時ディレクトリを作成
    tmpDir = await mkdtemp(join(tmpdir(), 'zenn-list-articles-test-'));

    // まず init を実行
    const initResult = await execZennCommand(['init'], tmpDir);
    expect(initResult.code).toBe(0);

    // 記事を作成
    const newArticleResult = await execZennCommand(['new:article'], tmpDir);
    expect(newArticleResult.code).toBe(0);

    // zenn list:articles コマンドを実行
    const result = await execZennCommand(['list:articles'], tmpDir);
    logIfFailed(result);
    expect(result.code).toBe(0);
  });

  it('list:books コマンドが正常に実行される', async () => {
    // 一時ディレクトリを作成
    tmpDir = await mkdtemp(join(tmpdir(), 'zenn-list-books-test-'));

    // まず init を実行
    const initResult = await execZennCommand(['init'], tmpDir);
    expect(initResult.code).toBe(0);

    // 本を作成
    const newBookResult = await execZennCommand(['new:book'], tmpDir);
    expect(newBookResult.code).toBe(0);

    // zenn list:books コマンドを実行
    const result = await execZennCommand(['list:books'], tmpDir);
    logIfFailed(result);
    expect(result.code).toBe(0);
  });
});
