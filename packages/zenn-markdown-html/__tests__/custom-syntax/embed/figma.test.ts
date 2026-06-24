import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Figma埋め込み要素のテスト', () => {
  const v1FileUrl =
    'https://www.figma.com/file/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0%3A1';
  const v1ProtoUrl =
    'https://www.figma.com/proto/LKQ4FJ4ExAmPLEedbRp931/Sample-Proto?node-id=1%3A2';
  const v2DesignUrl =
    'https://embed.figma.com/design/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0-1';
  const v2BoardUrl =
    'https://embed.figma.com/board/LKQ4FJ4ExAmPLEedbRp931/Sample-Board';
  const v2ProtoUrl =
    'https://embed.figma.com/proto/LKQ4FJ4ExAmPLEedbRp931/Sample-Proto?node-id=1-2';
  const invalidUrl =
    'https://www.figma.com/bad-example/file/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0%3A1';

  describe('デフォルトの挙動', () => {
    describe('v1 URL（www.figma.com/file）の場合', () => {
      test('embed.figma.com/design に変換して <iframe /> を生成する', async () => {
        const html = await markdownToHtml(`@[figma](${v1FileUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining(
              'https://embed.figma.com/design/LKQ4FJ4ExAmPLEedbRp931'
            ),
          })
        );
        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining('embed-host=zenn'),
          })
        );
        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining('node-id=0%3A1'),
          })
        );
      });
    });

    describe('v1 URL（www.figma.com/proto）の場合', () => {
      test('embed.figma.com/proto に変換して <iframe /> を生成する', async () => {
        const html = await markdownToHtml(`@[figma](${v1ProtoUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining(
              'https://embed.figma.com/proto/LKQ4FJ4ExAmPLEedbRp931'
            ),
          })
        );
        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining('embed-host=zenn'),
          })
        );
      });
    });

    describe('v2 URL（embed.figma.com/design）の場合', () => {
      test('そのまま embed.figma.com/design の <iframe /> を生成する', async () => {
        const html = await markdownToHtml(`@[figma](${v2DesignUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining(
              'https://embed.figma.com/design/LKQ4FJ4ExAmPLEedbRp931'
            ),
          })
        );
        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining('embed-host=zenn'),
          })
        );
      });
    });

    describe('v2 URL（embed.figma.com/board）の場合', () => {
      test('embed.figma.com/board の <iframe /> を生成する', async () => {
        const html = await markdownToHtml(`@[figma](${v2BoardUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining(
              'https://embed.figma.com/board/LKQ4FJ4ExAmPLEedbRp931'
            ),
          })
        );
      });
    });

    describe('v2 URL（embed.figma.com/proto）の場合', () => {
      test('embed.figma.com/proto の <iframe /> を生成する', async () => {
        const html = await markdownToHtml(`@[figma](${v2ProtoUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringContaining(
              'https://embed.figma.com/proto/LKQ4FJ4ExAmPLEedbRp931'
            ),
          })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', async () => {
        const html = await markdownToHtml(`@[figma](${invalidUrl})`);

        expect(html).toContain(
          '埋め込みに対応しているFigma URLを指定してください'
        );
      });
    });
  });

  describe('customEmbed.figma()を設定している場合', () => {
    test('渡した関数を実行する', async () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = await markdownToHtml(`@[figma](${v1FileUrl})`, {
        customEmbed: { figma: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
