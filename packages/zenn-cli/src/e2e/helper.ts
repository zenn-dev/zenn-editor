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
