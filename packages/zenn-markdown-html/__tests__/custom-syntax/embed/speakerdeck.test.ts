import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('SpeakerDeck埋め込み要素のテスト', () => {
  const validToken = 'example-token';
  const invalidToken = '@invalid-token';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', async () => {
        const html = await markdownToHtml(`@[speakerdeck](${validToken})`);
        const iframe = parse(html).querySelector(
          `span.embed-speakerdeck iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://speakerdeck.com/player/${validToken}`,
          })
        );
      });
    });

    describe('スライド番号付きの場合', () => {
      test('対応するクエリパラメータを含む<iframe />に変換する', async () => {
        const html = await markdownToHtml(
          `@[speakerdeck](${validToken}?slide=2)`
        );
        const iframe = parse(html).querySelector(
          'span.embed-speakerdeck iframe'
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://speakerdeck.com/player/${validToken}?slide=2`,
          })
        );
      });

      describe('XSSなどの悪意ある文字列がクエリに指定されている場合', () => {
        test('エラーメッセージを出力する', async () => {
          const xssQuery = '?slide=1"><script>alert("XSS")</script>';
          const html = await markdownToHtml(
            `@[speakerdeck](${validToken}${xssQuery})`
          );

          expect(html).toContain('Speaker Deckのkeyが不正です');
        });
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', async () => {
        const html = await markdownToHtml(`@[speakerdeck](${invalidToken})`);
        expect(html).toContain('Speaker Deckのkeyが不正です');
      });
    });
  });

  describe('customEmbed.speakerdeck()を設定している場合', () => {
    test('渡した関数を実行する', async () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = await markdownToHtml(`@[speakerdeck](${validToken})`, {
        customEmbed: { speakerdeck: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
