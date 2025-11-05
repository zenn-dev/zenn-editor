import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * zenn CLI のパス
 */
export const getZennCliPath = () => {
  const path = join(process.cwd(), 'dist', 'server', 'zenn.js');
  if (!existsSync(path)) {
    throw new Error(
      `${path}が見つかりません。pnpm build を実施してからテスト実行してください。`
    );
  }
  return path;
};

/**
 * zenn CLI コマンドを実行するヘルパー関数
 */
export const execZennCommand = (
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; code: number }> => {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [getZennCliPath(), ...args], {
      cwd,
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
      resolve({ stdout, stderr, code: code || 0 });
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to spawn zenn command: ${err.message}`));
    });
  });
};

/**
 * コマンド実行結果が失敗している場合にログを出力
 */
export const logIfFailed = (result: {
  stdout: string;
  stderr: string;
  code: number;
}) => {
  if (result.code !== 0) {
    console.error('STDOUT:', result.stdout);
    console.error('STDERR:', result.stderr);
  }
};

/**
 * zenn preview コマンドを起動して、起動エラーがないことを確認後に終了
 */
export const execZennPreview = (
  args: string[],
  cwd: string,
  timeoutMs: number = 3000
): Promise<{ stdout: string; stderr: string; hasError: boolean }> => {
  return new Promise((resolve) => {
    const child = spawn('node', [getZennCliPath(), ...args], {
      cwd,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';
    let hasError = false;

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      // エラーメッセージが含まれているかチェック
      if (data.toString().toLowerCase().includes('error')) {
        hasError = true;
      }
    });

    // 指定時間後にプロセスを終了
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ stdout, stderr, hasError });
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      hasError = true;
      stderr += err.message;
      child.kill('SIGTERM');
      resolve({ stdout, stderr, hasError });
    });

    child.on('close', () => {
      clearTimeout(timer);
      resolve({ stdout, stderr, hasError });
    });
  });
};
