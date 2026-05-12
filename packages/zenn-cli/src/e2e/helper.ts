import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

const FORCE_CLOSE_TIMEOUT_MS = 5000;

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
    let settled = false;

    const finalize = () => {
      if (settled) return;
      settled = true;
      resolve({ stdout, stderr, hasError });
    };

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
      // close を待ってから resolve することで、Windows での後続 cleanup と競合しないようにする
      child.kill();
    }, timeoutMs);

    // kill 後も close が来ないケースに備えて強制的に終了する
    const forceFinalizeTimer = setTimeout(() => {
      hasError = true;
      stderr += '\npreview process did not close in time';
      finalize();
    }, timeoutMs + FORCE_CLOSE_TIMEOUT_MS);

    child.on('error', (err) => {
      clearTimeout(timer);
      clearTimeout(forceFinalizeTimer);
      hasError = true;
      stderr += err.message;
      child.kill();
      finalize();
    });

    child.on('close', () => {
      clearTimeout(timer);
      clearTimeout(forceFinalizeTimer);
      finalize();
    });
  });
};
