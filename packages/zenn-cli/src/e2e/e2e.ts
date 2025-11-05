import { spawn } from 'child_process';
import { mkdtemp, rm, access } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { describe, it, expect, afterEach } from 'vitest';

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
    const zennCliPath = join(process.cwd(), 'dist', 'server', 'zenn.js');

    await new Promise<void>((resolve, reject) => {
      const child = spawn('node', [zennCliPath, 'init'], {
        cwd: tmpDir!,
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error('STDOUT:', stdout);
          console.error('STDERR:', stderr);
          reject(new Error(`zenn init exited with code ${code}`));
        } else {
          resolve();
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to spawn zenn init: ${err.message}`));
      });
    });

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
});
