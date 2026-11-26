import { beforeAll, describe, expect, test } from 'vitest';
import {
  AudioInputError,
  prepareAudioForUpload,
} from '../../lib/audio-convert';

// 16bitモノラルの非圧縮PCMのWAV。listInfoを渡すとタイトルのメタデータを付ける
function wavBytes(seconds: number, sampleRate = 8000, title?: string) {
  const samples = Math.round(sampleRate * seconds);
  const data = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) {
    // 圧縮されにくいよう雑音を混ぜる
    const value =
      Math.sin((i * 440 * 2 * Math.PI) / sampleRate) * 8000 +
      (((i * 7919) % 2000) - 1000);
    data.writeInt16LE(Math.round(value), i * 2);
  }
  const fmt = Buffer.alloc(24);
  fmt.write('fmt ', 0);
  fmt.writeUInt32LE(16, 4);
  fmt.writeUInt16LE(1, 8);
  fmt.writeUInt16LE(1, 10);
  fmt.writeUInt32LE(sampleRate, 12);
  fmt.writeUInt32LE(sampleRate * 2, 16);
  fmt.writeUInt16LE(2, 20);
  fmt.writeUInt16LE(16, 22);
  const dataHeader = Buffer.alloc(8);
  dataHeader.write('data', 0);
  dataHeader.writeUInt32LE(data.length, 4);
  const chunks = [fmt, dataHeader, data];
  if (title) {
    const text = Buffer.from(`${title}\0`.padEnd(title.length + 2, '\0'));
    const even = text.subarray(0, text.length - (text.length % 2));
    const info = Buffer.alloc(8);
    info.write('INAM', 0);
    info.writeUInt32LE(even.length, 4);
    const list = Buffer.alloc(12);
    list.write('LIST', 0);
    list.writeUInt32LE(4 + info.length + even.length, 4);
    list.write('INFO', 8);
    chunks.push(list, info, even);
  }
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0);
  header.writeUInt32LE(4 + body.length, 4);
  header.write('WAVE', 8);
  return Buffer.concat([header, body]);
}

describe('prepareAudioForUpload', () => {
  let shortM4a: Uint8Array;

  beforeAll(async () => {
    shortM4a = (await prepareAudioForUpload(wavBytes(1))).bytes;
  });

  test('30秒以内のWAVは切り捨てずにAACのm4aへ変換する', async () => {
    const audio = await prepareAudioForUpload(wavBytes(1));

    expect(audio).toMatchObject({
      contentType: 'audio/mp4',
      converted: true,
      trimmed: false,
    });
    expect(Buffer.from(audio.bytes.subarray(4, 8)).toString()).toBe('ftyp');
  });

  test('30秒を超えるWAVは先頭30秒だけを640KiB以下に変換する', async () => {
    const audio = await prepareAudioForUpload(wavBytes(33));

    expect(audio).toMatchObject({ converted: true, trimmed: true });
    expect(audio.bytes.length).toBeLessThanOrEqual(640 * 1024);
    // 30秒に収まっていれば、変換結果をm4aとして受け付けられる
    await expect(prepareAudioForUpload(audio.bytes)).resolves.toMatchObject({
      converted: false,
    });
  });

  test('条件を満たすm4aは再エンコードしない', async () => {
    const audio = await prepareAudioForUpload(shortM4a);

    expect(audio).toMatchObject({ converted: false, trimmed: false });
    expect(Buffer.from(audio.bytes.subarray(4, 8)).toString()).toBe('ftyp');
  });

  test('30秒を超えるm4aは再圧縮できないため受け付けない', async () => {
    const { BufferSource, BufferTarget, Conversion, Input, Mp4OutputFormat } =
      await import('mediabunny');
    const { Output, WAVE } = await import('mediabunny');
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({
      input: new Input({
        formats: [WAVE],
        source: new BufferSource(wavBytes(33)),
      }),
      output,
      audio: { codec: 'aac', bitrate: 32_000 },
    });
    await conversion.execute();
    const longM4a = new Uint8Array(output.target.buffer ?? new ArrayBuffer(0));
    expect(longM4a.length).toBeGreaterThan(0);
    expect(longM4a.length).toBeLessThanOrEqual(640 * 1024);

    await expect(prepareAudioForUpload(longM4a)).rejects.toThrow(
      AudioInputError
    );
    await expect(prepareAudioForUpload(longM4a)).rejects.toThrow('30秒以内');
  });

  test('メタデータは出力に残さない', async () => {
    const title = 'SECRET-PROJECT-TITLE';
    const source = wavBytes(1, 8000, title);
    expect(source.includes(title)).toBe(true);

    const converted = await prepareAudioForUpload(source);
    const repackaged = await prepareAudioForUpload(converted.bytes);

    expect(Buffer.from(converted.bytes).includes(title)).toBe(false);
    expect(Buffer.from(repackaged.bytes).includes(title)).toBe(false);
  });

  test('m4aのトラック名と言語は出力に残さず、同じ入力からは同じ出力になる', async () => {
    const {
      BufferSource,
      BufferTarget,
      EncodedAudioPacketSource,
      EncodedPacketSink,
      Input,
      MP4,
      Mp4OutputFormat,
      Output,
    } = await import('mediabunny');
    const trackName = 'SECRET-TRACK-NAME';
    const input = new Input({
      formats: [MP4],
      source: new BufferSource(shortM4a),
    });
    const track = await input.getPrimaryAudioTrack();
    const decoderConfig = await track?.getDecoderConfig();
    if (!track || !decoderConfig) throw new Error('fixture');
    const packetSource = new EncodedAudioPacketSource('aac');
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });
    output.addAudioTrack(packetSource, {
      name: trackName,
      languageCode: 'jpn',
    });
    await output.start();
    let first = true;
    for await (const packet of new EncodedPacketSink(track).packets()) {
      await packetSource.add(packet, first ? { decoderConfig } : undefined);
      first = false;
    }
    await output.finalize();
    const named = Buffer.from(output.target.buffer ?? new ArrayBuffer(0));
    expect(named.includes(trackName)).toBe(true);

    const audio = await prepareAudioForUpload(named);
    const again = await prepareAudioForUpload(named);

    expect(Buffer.from(audio.bytes).includes(trackName)).toBe(false);
    const reparsed = await new Input({
      formats: [MP4],
      source: new BufferSource(audio.bytes),
    }).getPrimaryAudioTrack();
    expect(await reparsed?.getName()).toBeNull();
    expect(Buffer.from(again.bytes).equals(Buffer.from(audio.bytes))).toBe(
      true
    );
  });

  test.each([
    ['MP3', Buffer.from([0x49, 0x44, 0x33, 4, 0, 0])],
    ['空のファイル', Buffer.alloc(0)],
    ['音声のないWAV', wavBytes(0)],
  ])('%sは受け付けない', async (_name, bytes) => {
    await expect(prepareAudioForUpload(bytes)).rejects.toBeInstanceOf(
      AudioInputError
    );
  });

  test('壊れたm4aは受け付けない', async () => {
    const broken = Buffer.from(shortM4a).subarray(0, 64);

    await expect(prepareAudioForUpload(broken)).rejects.toBeInstanceOf(
      AudioInputError
    );
  });
});
