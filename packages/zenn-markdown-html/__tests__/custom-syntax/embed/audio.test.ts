import { describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('音声埋め込み要素のテスト', () => {
  const validUrl =
    'https://storage.googleapis.com/zenn-user-upload/audio/0123456789ab.m4a';

  test('Zennにアップロードした音声は <audio /> を生成する', async () => {
    const html = await markdownToHtml(`@[audio](${validUrl})`);
    const audio = parse(html).querySelector('span.embed-audio audio');

    expect(audio?.attributes).toEqual(
      expect.objectContaining({ src: validUrl, controls: '' })
    );
  });

  test('自動再生などの属性は出力しない', async () => {
    const html = await markdownToHtml(`@[audio](${validUrl})`);
    const audio = parse(html).querySelector('audio');

    expect(audio?.attributes).not.toHaveProperty('autoplay');
    expect(audio?.attributes).not.toHaveProperty('loop');
  });

  test.each([
    ['外部ホスト', 'https://example.com/audio.m4a'],
    ['別のバケット', 'https://storage.googleapis.com/other-bucket/audio.m4a'],
    [
      'バケット名の前方一致',
      'https://storage.googleapis.com/zenn-user-upload-evil/audio.m4a',
    ],
    [
      'パスの遡り',
      'https://storage.googleapis.com/zenn-user-upload/../other-bucket/a.m4a',
    ],
    ['http', 'http://storage.googleapis.com/zenn-user-upload/audio.m4a'],
    [
      'クエリ付き',
      'https://storage.googleapis.com/zenn-user-upload/audio.m4a?x=1',
    ],
    [
      '属性の挿入',
      'https://storage.googleapis.com/zenn-user-upload/a.m4a" autoplay="',
    ],
  ])('%sのURLでは <audio /> を生成しない', async (_name, url) => {
    const html = await markdownToHtml(`@[audio](${url})`);

    expect(parse(html).querySelector('audio')).toBeNull();
    expect(html).toContain('Zennにアップロードした音声のURLを指定してください');
  });
});
