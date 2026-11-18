import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const aiScanMock = vi.hoisted(() => vi.fn());
const audioScanMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/scrap-ai-scan', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../lib/scrap-ai-scan')>();
  return {
    ...actual,
    scanImageWithAi: aiScanMock,
    scanAudioWithAi: audioScanMock,
  };
});

import { exec } from '../../commands/file';
import { prepareAudioForUpload } from '../../lib/audio-convert';
import { ScrapAiDetectedError } from '../../lib/scrap-ai-scan';

const scanEnvironmentNames = [
  'ZENN_CLI_FORCE_SAFE',
  'ZENN_CLI_AI_SCAN',
  'ZENN_CLI_AI_PROVIDER',
  'ZENN_CLI_AI_MODEL',
] as const;

const pngBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// 16bitモノラルの非圧縮PCMのWAV
function wavBytes(seconds: number, sampleRate = 44100) {
  const samples = Math.round(sampleRate * seconds);
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + samples * 2, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const value = Math.sin((i * 440 * 2 * Math.PI) / sampleRate) * 8000;
    bytes.writeInt16LE(Math.round(value), 44 + i * 2);
  }
  return bytes;
}

function isM4a(bytes: Uint8Array) {
  return Buffer.from(bytes.subarray(4, 8)).toString('ascii') === 'ftyp';
}

describe('fileコマンド', () => {
  // 変換済みのAAC（m4a）
  let m4aBytes: Buffer;
  let directory: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    m4aBytes = Buffer.from((await prepareAudioForUpload(wavBytes(1))).bytes);
  });

  beforeEach(async () => {
    process.exitCode = undefined;
    directory = await mkdtemp(path.join(tmpdir(), 'zenn-file-test-'));
    scanEnvironmentNames.forEach((name) => delete process.env[name]);
    process.env.ZENN_API_KEY = 'test-api-key';
    aiScanMock.mockResolvedValue([]);
    audioScanMock.mockResolvedValue([]);
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    process.exitCode = undefined;
    delete process.env.ZENN_API_KEY;
    scanEnvironmentNames.forEach((name) => delete process.env[name]);
    aiScanMock.mockReset();
    audioScanMock.mockReset();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  async function localFile(name: string, bytes: number[] | Buffer) {
    const file = path.join(directory, name);
    await writeFile(file, Buffer.from(bytes));
    return file;
  }

  function mockUploaded(file: Record<string, unknown>) {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(file), { status: 201 })
    );
  }

  const audioFile = {
    id: 123,
    type: 'audio',
    url: 'https://storage.example.com/audio.m4a',
    size: 2048,
    created_at: '2026-11-18T10:00:00.000+09:00',
    duration_ms: 12345,
  };

  describe('--type', () => {
    test.each([
      ['upload', ['upload', 'a.png', '--confirm-public']],
      ['list', ['list']],
      ['delete', ['delete', '42', '--yes']],
      ['不正な値', ['list', '--type', 'video']],
    ])('%sで種類を指定しなければAPIを呼ばない', async (_name, argv) => {
      await exec(argv);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test('拡張子や中身から種類を推測しない', async () => {
      const file = await localFile('audio.m4a', m4aBytes);

      await exec(['upload', file, '--type', 'image', '--confirm-public']);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('upload', () => {
    test('音声を種類付きで送信し、machine-readableではFileのJSONを1行で出力する', async () => {
      const file = await localFile('audio.m4a', m4aBytes);
      mockUploaded(audioFile);

      await exec([
        'upload',
        file,
        '--type',
        'audio',
        '--confirm-public',
        '--machine-readable',
      ]);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url.toString()).toBe('https://zenn.dev/api/public-api/v0/files');
      expect(options.method).toBe('POST');
      expect(options.body.get('type')).toBe('audio');
      expect(options.body.get('file')).toMatchObject({
        name: 'audio.m4a',
        type: 'audio/mp4',
      });
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(audioFile));
      expect(process.exitCode).toBeUndefined();
    });

    test('machine-readableでなければURLを表示する', async () => {
      const file = await localFile('image.png', pngBytes);
      mockUploaded({
        id: 5,
        type: 'image',
        url: 'https://storage.example.com/image.png',
      });

      await exec(['upload', file, '--type', 'image', '--confirm-public']);

      expect(fetchMock.mock.calls[0][1].body.get('type')).toBe('image');
      expect(console.log).toHaveBeenLastCalledWith(
        'https://storage.example.com/image.png'
      );
    });

    test('--confirm-publicがなければAPIを呼ばない', async () => {
      const file = await localFile('audio.m4a', m4aBytes);

      await exec(['upload', file, '--type', 'audio']);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test('変換済みのm4aはそのまま送信する', async () => {
      const file = await localFile('audio.m4a', m4aBytes);
      mockUploaded(audioFile);

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      const sent = fetchMock.mock.calls[0][1].body.get('file') as File;
      expect(Buffer.from(await sent.arrayBuffer()).equals(m4aBytes)).toBe(true);
    });

    test('WAVは先頭30秒をAACのm4aへ変換して送信する', async () => {
      const file = await localFile('voice.wav', wavBytes(32, 8000));
      mockUploaded(audioFile);

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      const sent = fetchMock.mock.calls[0][1].body.get('file') as File;
      expect(sent).toMatchObject({ name: 'voice.m4a', type: 'audio/mp4' });
      const bytes = new Uint8Array(await sent.arrayBuffer());
      expect(isM4a(bytes)).toBe(true);
      expect(bytes.length).toBeLessThanOrEqual(640 * 1024);
      // 送信した音声が30秒以内なら、再変換せずそのまま受け付けられる
      await expect(prepareAudioForUpload(bytes)).resolves.toMatchObject({
        converted: false,
      });
      expect(process.exitCode).toBeUndefined();
    });

    test('変換できない形式の音声は送信しない', async () => {
      const file = await localFile('audio.mp3', [0x49, 0x44, 0x33, 4, 0, 0]);

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test('list・deleteの入力エラーでは音声の変換方法を案内しない', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'invalid_request' } }), {
          status: 400,
        })
      );

      await exec(['list', '--type', 'audio']);

      expect(process.exitCode).toBe(1);
      expect(console.error).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('ffmpeg')
      );
    });

    test('応答の種類が指定と異なれば成功として扱わない', async () => {
      const file = await localFile('audio.m4a', m4aBytes);
      mockUploaded({ ...audioFile, type: 'image' });

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      expect(console.log).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test('音声アップロードを利用できないアカウントでは失敗を返す', async () => {
      const file = await localFile('audio.m4a', m4aBytes);
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'audio_upload_unavailable' } }),
          { status: 403 }
        )
      );

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('audio_upload_unavailable')
      );
    });
  });

  describe('AI scan', () => {
    function enableAiScan(provider = 'openai', model?: string) {
      process.env.ZENN_CLI_AI_SCAN = 'true';
      process.env.ZENN_CLI_AI_PROVIDER = provider;
      if (model) process.env.ZENN_CLI_AI_MODEL = model;
    }
    const enableAudioAiScan = () => enableAiScan('vertex', 'gemini-3-flash');

    test('画像は有効時にAI scanしてからアップロードする', async () => {
      enableAiScan();
      const file = await localFile('image.png', pngBytes);
      mockUploaded({
        id: 5,
        type: 'image',
        url: 'https://storage.example.com/image.png',
      });

      await exec(['upload', file, '--type', 'image', '--confirm-public']);

      expect(aiScanMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('音声は有効時に変換後の内容をAI scanしてからアップロードする', async () => {
      enableAudioAiScan();
      const file = await localFile('voice.wav', wavBytes(1));
      mockUploaded(audioFile);

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      expect(aiScanMock).not.toHaveBeenCalled();
      expect(audioScanMock).toHaveBeenCalledTimes(1);
      const scanned = audioScanMock.mock.calls[0][0];
      expect(scanned).toMatchObject({
        filename: 'voice.m4a',
        contentType: 'audio/mp4',
      });
      const sent = fetchMock.mock.calls[0][1].body.get('file') as File;
      expect(Buffer.from(await sent.arrayBuffer()).equals(scanned.bytes)).toBe(
        true
      );
    });

    test('音声で検知した場合や検査できない場合はアップロードしない', async () => {
      enableAudioAiScan();
      audioScanMock.mockRejectedValue(new ScrapAiDetectedError('検知'));
      const file = await localFile('audio.m4a', m4aBytes);

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test('音声もdangerouslyオプションでAI scanをスキップできる', async () => {
      enableAudioAiScan();
      const file = await localFile('audio.m4a', m4aBytes);
      mockUploaded(audioFile);

      await exec([
        'upload',
        file,
        '--type',
        'audio',
        '--confirm-public',
        '--dangerously-skip-ai-scan',
      ]);

      expect(audioScanMock).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('FORCE_SAFEでは音声もAI scanなしでアップロードしない', async () => {
      process.env.ZENN_CLI_FORCE_SAFE = 'true';
      const file = await localFile('audio.m4a', m4aBytes);

      await exec(['upload', file, '--type', 'audio', '--confirm-public']);

      expect(audioScanMock).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('list', () => {
    test('種類とページングを指定して一覧を取得する', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ files: [], next_page: null }), {
          status: 200,
        })
      );

      await exec([
        'list',
        '--type',
        'audio',
        '--page',
        '2',
        '--count',
        '10',
        '--machine-readable',
      ]);

      expect(fetchMock.mock.calls[0][0].toString()).toBe(
        'https://zenn.dev/api/public-api/v0/files?type=audio&page=2&count=10'
      );
      expect(console.log).toHaveBeenCalledWith(
        JSON.stringify({ files: [], next_page: null })
      );
    });

    test('範囲外のページ指定ではAPIを呼ばない', async () => {
      await exec(['list', '--type', 'image', '--count', '101']);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('delete', () => {
    test('種類とIDを指定して削除する', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await exec([
        'delete',
        '42',
        '--type',
        'audio',
        '--yes',
        '--machine-readable',
      ]);

      expect(fetchMock.mock.calls[0][0].toString()).toBe(
        'https://zenn.dev/api/public-api/v0/files/42?type=audio'
      );
      expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
      expect(console.log).toHaveBeenCalledWith(
        JSON.stringify({ deleted: true, type: 'audio', id: 42 })
      );
    });

    test('確認なしまたは不正なIDでの削除はAPIを呼ばない', async () => {
      await exec(['delete', '42', '--type', 'audio']);
      await exec(['delete', '42abc', '--type', 'audio', '--yes']);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    test('使用中のファイルの削除は失敗として表示する', async () => {
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'file_in_use' } }), {
          status: 409,
        })
      );

      await exec(['delete', '42', '--type', 'image', '--yes']);

      expect(process.exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('file_in_use')
      );
    });
  });
});
