import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { exec } from '../../commands/image';

describe('imageコマンド', () => {
  let directory: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    process.exitCode = undefined;
    directory = await mkdtemp(path.join(tmpdir(), 'zenn-image-test-'));
    process.env.ZENN_API_KEY = 'test-api-key';
    process.env.ZENN_CLI_EXPERIMENTAL_IMAGE_API = 'true';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.exitCode = undefined;
    delete process.env.ZENN_API_KEY;
    delete process.env.ZENN_CLI_EXPERIMENTAL_IMAGE_API;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  async function imageFile(name: string, bytes: number[]) {
    const file = path.join(directory, name);
    await writeFile(file, Buffer.from(bytes));
    return file;
  }

  test('helpは最新Public APIの公開・保持・容量・レート制限を案内する', async () => {
    await exec(['--help']);

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('image delete IMAGE_ID --yes')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('50ファイル、合計50MiB')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('本で使用中の画像は削除できません')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('IPアドレスごとに毎分60リクエスト')
    );
  });

  test('確認後に画像をアップロードしてmachine-readableではURLだけを出力する', async () => {
    const file = await imageFile(
      'image.png',
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    );
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ image_url: 'https://storage.example.com/image.png' }),
        { status: 201 }
      )
    );

    await exec(['upload', file, '--confirm-public', '--machine-readable']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      'https://storage.example.com/image.png'
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('自動的には削除されません')
    );
  });

  test('--confirm-publicがなければ画像を読み込まずAPIも呼ばない', async () => {
    await exec(['upload', path.join(directory, 'missing.png')]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  test('画像一覧をページングして取得する', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ images: [], next_page: null }), {
        status: 200,
      })
    );

    await exec(['list', '--page', '2', '--count', '10', '--machine-readable']);

    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      'https://zenn.dev/api/public-api/v1/images?page=2&count=10'
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ images: [], next_page: null })
    );
  });

  test('画像をID指定で削除する', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await exec(['delete', '42', '--yes', '--machine-readable']);

    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      'https://zenn.dev/api/public-api/v1/images/42'
    );
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({ deleted: true, image_id: 42 })
    );
  });

  test('確認なしまたは不正なIDでの削除はAPIを呼ばない', async () => {
    await exec(['delete', '42']);
    await exec(['delete', '42abc', '--yes']);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  test('本で使用中の画像の削除は失敗として表示する', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'image_in_use' } }), {
        status: 409,
      })
    );

    await exec(['delete', '42', '--yes']);

    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('本で使用中の画像は削除できません')
    );
  });

  test('未対応形式はAPIへ送信しない', async () => {
    const file = await imageFile('image.svg', [0x3c, 0x73, 0x76, 0x67]);

    await exec(['upload', file, '--confirm-public']);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  test('3MiBを超える画像はAPIへ送信しない', async () => {
    const bytes = Buffer.alloc(3 * 1024 * 1024 + 1);
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = path.join(directory, 'large.png');
    await writeFile(file, bytes);

    await exec(['upload', file, '--confirm-public']);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  test.each([
    ['jpeg', [0xff, 0xd8, 0xff], 'image/jpeg'],
    ['gif', [...Buffer.from('GIF89a')], 'image/gif'],
    ['webp', [...Buffer.from('RIFF0000WEBP')], 'image/webp'],
  ])('%s形式をContent-Type付きで送信する', async (extension, bytes, type) => {
    const file = await imageFile(`image.${extension}`, bytes as number[]);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          image_url: `https://storage.example.com/image.${extension}`,
        }),
        { status: 201 }
      )
    );

    await exec(['upload', file, '--confirm-public']);

    const uploaded = fetchMock.mock.calls[0][1].body.get('file');
    expect(uploaded).toMatchObject({ type });
  });

  test('実験的機能が無効なら画像を読み込まずAPIも呼ばない', async () => {
    delete process.env.ZENN_CLI_EXPERIMENTAL_IMAGE_API;

    await exec([
      'upload',
      path.join(directory, 'missing.png'),
      '--confirm-public',
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
