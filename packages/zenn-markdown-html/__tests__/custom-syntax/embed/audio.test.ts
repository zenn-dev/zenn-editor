import { describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';
import { isZennAudioUrl } from '../../../src/utils/url-matcher';

const audioOrigin = 'https://user-upload.zenn.studio';
const audioId = '0123456789abcdef0123456789abcdef';
const validUrl = `${audioOrigin}/audio/${audioId}.m4a`;
const invalidUrlMessage = 'Zennにアップロードした音声のURLを指定してください';

describe('音声埋め込み要素のテスト', () => {
  const options = { audioEmbed: true, audioOrigins: [audioOrigin] };

  test('Zennにアップロードした音声は <audio /> を生成する', async () => {
    const html = await markdownToHtml(`@[audio](${validUrl})`, options);
    const audio = parse(html).querySelector('span.embed-audio audio');

    expect(audio?.attributes).toEqual(
      expect.objectContaining({
        src: validUrl,
        controls: '',
        preload: 'metadata',
      })
    );
  });

  test('自動再生などの属性は出力しない', async () => {
    const html = await markdownToHtml(`@[audio](${validUrl})`, options);
    const audio = parse(html).querySelector('audio');

    expect(audio?.attributes).not.toHaveProperty('autoplay');
    expect(audio?.attributes).not.toHaveProperty('loop');
  });

  test.each([
    ['外部ホスト', `https://example.com/audio/${audioId}.m4a`],
    [
      'ホスト名の前方一致',
      `https://user-upload.zenn.studio.evil.example/audio/${audioId}.m4a`,
    ],
    ['http', `http://user-upload.zenn.studio/audio/${audioId}.m4a`],
    ['クエリ付き', `${validUrl}?x=1`],
    ['属性の挿入', `${validUrl}" autoplay="`],
  ])('%sのURLでは <audio /> を生成しない', async (_name, url) => {
    const html = await markdownToHtml(`@[audio](${url})`, options);

    expect(parse(html).querySelector('audio')).toBeNull();
    expect(html).toContain(invalidUrlMessage);
  });

  describe('audioEmbed が有効でない場合', () => {
    test.each([
      ['オプションなし', undefined],
      ['audioOrigins だけを指定', { audioOrigins: [audioOrigin] }],
      [
        'audioEmbed が false',
        { audioEmbed: false, audioOrigins: [audioOrigin] },
      ],
    ])('%sでは <audio /> を生成せずリンクにする', async (_name, opts) => {
      const html = await markdownToHtml(`@[audio](${validUrl})`, opts);
      const root = parse(html);

      expect(root.querySelector('audio')).toBeNull();
      expect(root.querySelector('a')?.attributes).toEqual(
        expect.objectContaining({
          href: validUrl,
          rel: 'noreferrer noopener nofollow',
          target: '_blank',
        })
      );
    });

    test('URLでない文字列はリンクにしない', async () => {
      const html = await markdownToHtml('@[audio](javascript:alert(1))');
      const root = parse(html);

      expect(root.querySelector('audio')).toBeNull();
      expect(root.querySelector('a')).toBeNull();
      expect(html).toContain('URLが不正です');
    });
  });

  test('audioOrigins を指定しない場合は <audio /> を生成しない', async () => {
    const html = await markdownToHtml(`@[audio](${validUrl})`, {
      audioEmbed: true,
    });

    expect(parse(html).querySelector('audio')).toBeNull();
    expect(html).toContain(invalidUrlMessage);
  });
});

describe('isZennAudioUrl', () => {
  const origins = [audioOrigin];

  test('許可した配信元の音声のURLは true を返す', () => {
    expect(isZennAudioUrl(validUrl, origins)).toBe(true);
  });

  test('配信元の末尾のスラッシュは無視する', () => {
    expect(isZennAudioUrl(validUrl, [`${audioOrigin}/`])).toBe(true);
  });

  test('複数の配信元のいずれかに当てはまれば true を返す', () => {
    expect(
      isZennAudioUrl(validUrl, ['https://other.example.com', audioOrigin])
    ).toBe(true);
  });

  test('audioOrigins が空・未指定なら false を返す', () => {
    expect(isZennAudioUrl(validUrl)).toBe(false);
    expect(isZennAudioUrl(validUrl, [])).toBe(false);
  });

  test.each([
    ['URLでない文字列', 'audio.m4a'],
    ['外部ホスト', `https://example.com/audio/${audioId}.m4a`],
    [
      'ホスト名の前方一致',
      `https://user-upload.zenn.studio.evil.example/audio/${audioId}.m4a`,
    ],
    [
      'ホスト名の後方一致',
      `https://evil-user-upload.zenn.studio/audio/${audioId}.m4a`,
    ],
    [
      '認証情報でホストを偽装',
      `https://user-upload.zenn.studio@evil.example/audio/${audioId}.m4a`,
    ],
    [
      '認証情報付き',
      `https://user@user-upload.zenn.studio/audio/${audioId}.m4a`,
    ],
    ['別のポート', `https://user-upload.zenn.studio:8443/audio/${audioId}.m4a`],
    ['http', `http://user-upload.zenn.studio/audio/${audioId}.m4a`],
    [
      '大文字のスキーム',
      `HTTPS://user-upload.zenn.studio/audio/${audioId}.m4a`,
    ],
    ['大文字のホスト', `https://USER-UPLOAD.zenn.studio/audio/${audioId}.m4a`],
    ['パスの遡り', `${audioOrigin}/images/../audio/${audioId}.m4a`],
    ['audio からの遡り', `${audioOrigin}/audio/../audio/${audioId}.m4a`],
    [
      'エンコードされたパスの遡り',
      `${audioOrigin}/images/%2e%2e/audio/${audioId}.m4a`,
    ],
    ['エンコードされた文字', `${audioOrigin}/audio/${audioId}%2em4a`],
    ['バックスラッシュ', `${audioOrigin}\\audio\\${audioId}.m4a`],
    ['重複したスラッシュ', `${audioOrigin}//audio/${audioId}.m4a`],
    ['audio 以外のパス', `${audioOrigin}/images/${audioId}.m4a`],
    ['audio より深いパス', `${audioOrigin}/audio/a/${audioId}.m4a`],
    ['短いID', `${audioOrigin}/audio/0123456789ab.m4a`],
    ['大文字のID', `${audioOrigin}/audio/${audioId.toUpperCase()}.m4a`],
    ['別の拡張子', `${audioOrigin}/audio/${audioId}.mp3`],
    ['クエリ付き', `${validUrl}?x=1`],
    ['空のクエリ', `${validUrl}?`],
    ['フラグメント付き', `${validUrl}#t=10`],
    ['空のフラグメント', `${validUrl}#`],
    ['前後の空白', ` ${validUrl}`],
    ['末尾の改行', `${validUrl}\n`],
    ['属性の挿入', `${validUrl}" autoplay="`],
  ])('%sは false を返す', (_name, url) => {
    expect(isZennAudioUrl(url, origins)).toBe(false);
  });

  describe('配信元にパスの接頭辞を指定した場合', () => {
    const prefixed = ['http://localhost:8787/uploads/bucket'];

    test('接頭辞の下の音声のURLは true を返す', () => {
      expect(
        isZennAudioUrl(
          `http://localhost:8787/uploads/bucket/audio/${audioId}.m4a`,
          prefixed
        )
      ).toBe(true);
    });

    test.each([
      ['接頭辞なし', `http://localhost:8787/audio/${audioId}.m4a`],
      [
        '接頭辞の前方一致',
        `http://localhost:8787/uploads/bucket-evil/audio/${audioId}.m4a`,
      ],
      [
        '接頭辞からの遡り',
        `http://localhost:8787/uploads/bucket/../other/audio/${audioId}.m4a`,
      ],
      [
        '別のポート',
        `http://localhost:8788/uploads/bucket/audio/${audioId}.m4a`,
      ],
    ])('%sは false を返す', (_name, url) => {
      expect(isZennAudioUrl(url, prefixed)).toBe(false);
    });
  });

  test.each([
    ['URLでない文字列', 'user-upload.zenn.studio'],
    ['http・https 以外', 'ftp://user-upload.zenn.studio'],
    ['クエリ付き', `${audioOrigin}?x=1`],
    ['認証情報付き', 'https://user@user-upload.zenn.studio'],
  ])('配信元が%sの場合は許可しない', (_name, origin) => {
    expect(isZennAudioUrl(validUrl, [origin])).toBe(false);
  });
});
