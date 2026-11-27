import { describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';
import {
  isZennAudioUrl,
  normalizeLocalAudioPath,
} from '../../../src/utils/url-matcher';

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

    test.each([
      ['javascript スキーム', 'javascript:alert(1)'],
      ['大文字が混ざった javascript スキーム', 'JaVaScRiPt:alert(1)'],
      ['data スキーム', 'data:audio/mp4;base64,AAAA'],
      ['スキームの省略', '//example.com/a.m4a'],
    ])('%sはリンクにしない', async (_name, url) => {
      const html = await markdownToHtml(`@[audio](${url})`);
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
    [
      '既定のポートの明示',
      `https://user-upload.zenn.studio:443/audio/${audioId}.m4a`,
    ],
    ['全角のホスト', `https://ｕser-upload.zenn.studio/audio/${audioId}.m4a`],
    [
      '末尾がドットのホスト',
      `https://user-upload.zenn.studio./audio/${audioId}.m4a`,
    ],
    [
      'ホストの途中のタブ',
      `https://user-up\tload.zenn.studio/audio/${audioId}.m4a`,
    ],
    ['スラッシュの省略', `https:user-upload.zenn.studio/audio/${audioId}.m4a`],
    [
      'スラッシュの過多',
      `https:///user-upload.zenn.studio/audio/${audioId}.m4a`,
    ],
    [
      'バックスラッシュと認証情報でホストを偽装',
      `https://evil.example\\@user-upload.zenn.studio/audio/${audioId}.m4a`,
    ],
    ['エンコードされたパス', `${audioOrigin}/%61udio/${audioId}.m4a`],
    ['カレントディレクトリ', `${audioOrigin}/audio/./${audioId}.m4a`],
    ['末尾のスラッシュ', `${validUrl}/`],
    ['末尾のNULL文字', `${validUrl}%00`],
  ])('%sは false を返す', (_name, url) => {
    expect(isZennAudioUrl(url, origins)).toBe(false);
  });

  test('audioOrigins が配列でなければ false を返す', () => {
    expect(isZennAudioUrl(validUrl, audioOrigin as unknown as string[])).toBe(
      false
    );
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
    ['空のクエリ付き', `${audioOrigin}/?`],
    ['空のフラグメント付き', `${audioOrigin}/#`],
    ['空の認証情報付き', 'https://@user-upload.zenn.studio'],
    ['パスの遡りを含む接頭辞', `${audioOrigin}/x/..`],
    ['大文字のホスト', 'https://USER-UPLOAD.zenn.studio'],
    ['既定のポートの明示', `${audioOrigin}:443`],
    ['認証情報付き', 'https://user@user-upload.zenn.studio'],
  ])('配信元が%sの場合は許可しない', (_name, origin) => {
    expect(isZennAudioUrl(validUrl, [origin])).toBe(false);
  });
});

describe('files ディレクトリの音声（audioLocalPaths）', () => {
  const options = {
    audioEmbed: true,
    audioOrigins: [audioOrigin],
    audioLocalPaths: true,
  };
  const encodedJapanese = '/files/%E6%97%A5%E6%9C%AC%E8%AA%9E.m4a';
  const audioSrc = async (path: string, opts: object = options) => {
    const html = await markdownToHtml(`@[audio](${path})`, opts);
    return parse(html).querySelector('span.embed-audio audio')?.attributes.src;
  };

  test('相対パスを <audio /> の src にそのまま出力する', async () => {
    const html = await markdownToHtml('@[audio](/files/intro.m4a)', options);
    const audio = parse(html).querySelector('span.embed-audio audio');

    expect(audio?.attributes).toEqual({
      src: '/files/intro.m4a',
      controls: '',
      preload: 'metadata',
    });
  });

  test('audioOrigins を指定しなくても相対パスを出力する', async () => {
    expect(
      await audioSrc('/files/intro.m4a', {
        audioEmbed: true,
        audioLocalPaths: true,
      })
    ).toBe('/files/intro.m4a');
  });

  test('サブディレクトリのパスを出力する', async () => {
    expect(await audioSrc('/files/ch1/intro.m4a')).toBe('/files/ch1/intro.m4a');
  });

  test.each([
    ['そのまま書いた日本語', '/files/日本語.m4a'],
    ['エンコードした日本語', encodedJapanese],
  ])('%sのファイル名は、エンコードした src になる', async (_name, path) => {
    expect(await audioSrc(path)).toBe(encodedJapanese);
  });

  test('NFD のファイル名は NFC に正規化する', async () => {
    const nfd = '\u304b\u3099'; // 「か」+ 結合文字の濁点
    const nfc = '\u304c'; // 「が」
    expect(nfd).not.toBe(nfc);

    expect(await audioSrc(`/files/${nfd}.m4a`)).toBe(
      `/files/${encodeURIComponent(nfc)}.m4a`
    );
  });

  test('空白を含むファイル名は %20 にエンコードする', async () => {
    expect(await audioSrc('/files/my%20intro.m4a')).toBe(
      '/files/my%20intro.m4a'
    );
  });

  test('許可した配信元の URL は従来どおり <audio /> を生成する', async () => {
    expect(await audioSrc(validUrl)).toBe(validUrl);
  });

  test('audioLocalPaths を指定しなければ相対パスを出力しない', async () => {
    const html = await markdownToHtml('@[audio](/files/intro.m4a)', {
      audioEmbed: true,
      audioOrigins: [audioOrigin],
    });

    expect(parse(html).querySelector('audio')).toBeNull();
    expect(html).toContain(invalidUrlMessage);
  });

  test('audioEmbed が false なら audioLocalPaths を無視する', async () => {
    const html = await markdownToHtml('@[audio](/files/intro.m4a)', {
      audioEmbed: false,
      audioLocalPaths: true,
    });

    expect(parse(html).querySelector('audio')).toBeNull();
    expect(html).toContain('URLが不正です');
  });

  const invalidPaths: [string, string][] = [
    ['パスの遡り', '/files/../secret.m4a'],
    ['エンコードされたパスの遡り', '/files/%2e%2e/secret.m4a'],
    ['エンコードされたスラッシュでの遡り', '/files/a%2F..%2F..%2Fx.m4a'],
    ['二重のエンコード', '/files/a%252e.m4a'],
    ['不正なエンコード', '/files/%E6.m4a'],
    ['クエリ付き', '/files/intro.m4a?x=1'],
    ['エンコードされたクエリ', '/files/intro.m4a%3Fx=1.m4a'],
    ['フラグメント付き', '/files/intro.m4a#t=10'],
    ['別の拡張子', '/files/intro.mp3'],
    ['大文字の拡張子', '/files/intro.M4A'],
    ['images ディレクトリ', '/images/intro.m4a'],
    ['プロトコル相対 URL', '//evil.example/files/a.m4a'],
    ['重複したスラッシュ', '/files//a.m4a'],
    ['カレントディレクトリ', '/files/./a.m4a'],
    ['バックスラッシュ', '/files/..\\secret.m4a'],
    ['エンコードされたバックスラッシュ', '/files/..%5Csecret.m4a'],
    ['エンコードされた NULL 文字', '/files/a%00.m4a'],
    ['先頭のスラッシュなし', 'files/intro.m4a'],
    ['相対パス', '../files/intro.m4a'],
    ['エンコードされた files', '/%66iles/intro.m4a'],
    ['ファイル名なし', '/files/'],
  ];

  test.each(invalidPaths)('%sは <audio /> を生成しない', async (_n, path) => {
    const html = await markdownToHtml(`@[audio](${path})`, options);

    expect(parse(html).querySelector('audio')).toBeNull();
    expect(html).toContain(invalidUrlMessage);
  });

  describe('normalizeLocalAudioPath', () => {
    test('正規形のパスを返す', () => {
      expect(normalizeLocalAudioPath('/files/intro.m4a')).toBe(
        '/files/intro.m4a'
      );
      expect(normalizeLocalAudioPath('/files/日本語.m4a')).toBe(
        encodedJapanese
      );
      expect(normalizeLocalAudioPath(encodedJapanese)).toBe(encodedJapanese);
    });

    test.each(invalidPaths)('%sは null を返す', (_name, path) => {
      expect(normalizeLocalAudioPath(path)).toBeNull();
    });

    test.each([
      ['改行', '/files/a\n.m4a'],
      ['対にならないサロゲート', '/files/\ud800.m4a'],
      ['文字列でない値', undefined as unknown as string],
    ])('%sは null を返す', (_name, path) => {
      expect(normalizeLocalAudioPath(path)).toBeNull();
    });
  });
});
