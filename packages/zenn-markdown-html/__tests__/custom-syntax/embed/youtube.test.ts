import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Youtube埋め込み要素のテスト', () => {
  const validVideoId = 'exampletest'; // 11文字する
  const invalidVideoId = '@bad-video-id';

  describe('デフォルトの挙動', () => {
    describe('有効なvideoIdの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[youtube](${validVideoId})`);
        const iframe = parse(html).querySelector(`span.embed-youtube iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://www.youtube-nocookie.com/embed/${validVideoId}`,
          })
        );
      });
    });

    describe('無効なvideoIdの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[youtube](${invalidVideoId})`);
        expect(html).toContain('YouTubeのvideoIDが不正です');
      });
    });
  });

  describe('customEmbed.youtube()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[youtube](${validVideoId})`, {
        customEmbed: { youtube: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
