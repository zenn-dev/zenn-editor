import { describe, test, expect } from 'vitest';
import markdownToHtml from '../../../src';

describe('埋め込み要素の共通テスト', () => {
  describe('埋め込み要素のバリデーションテスト', () => {
    describe('文字数制限がある記法について', () => {
      const getRestrictedEmbedList = (token: string) => [
        // linkify
        `https://twitter.com/zenn_dev/status/${token}`,
        `http://youtu.be/${token}`,

        // custom
        `@[youtube](${token})`,
        `@[slideshare](${token})`,
        `@[speakerdeck](${token})`,
        `@[jsfiddle](${token})`,
        `@[codepen](${token})`,
        `@[codesandbox](${token})`,
        `@[stackblitz](${token})`,
        `@[tweet](${token})`,
        `@[blueprintue](${token})`,
        `@[figma](${token})`,
        `@[gist](${token})`,
      ];

      describe('URLやTokenが300文字より長い場合', () => {
        test('エラーメッセージを出力', async () => {
          const dummy = Array(301).fill('a').join('');
          const tokens = getRestrictedEmbedList(dummy);

          for (const text of tokens) {
            const html = await markdownToHtml(text);
            expect(html).toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          }
        });
      });

      describe('URLやTokenが300文字以下の場合', () => {
        test('エラーメッセージを出力しない', async () => {
          const tokens = getRestrictedEmbedList('example');
          for (const text of tokens) {
            const html = await markdownToHtml(text);
            expect(html).not.toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          }
        });
      });
    });

    describe('文字数制限が無い記法について', () => {
      const getEmbedList = (token: string) => [
        // linkify
        `https://zenn.dev/${token}`,
        `https://github.com/zenn-dev/zenn-editor/blob/canary/${token}`,

        // custom
        `@[card](http://youtu.be/${token})`,
        `@[github](https://github.com/zenn-dev/zenn-editor/blob/canary/${token})`,
      ];

      describe('URLやTokenが300文字より長い場合', () => {
        test('エラーメッセージを出力しない', async () => {
          const dummy = Array(350).fill('a').join('');
          const tokens = getEmbedList(dummy);

          for (const text of tokens) {
            const html = await markdownToHtml(text);
            expect(html).not.toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          }
        });
      });

      describe('URLやTokenが300文字以下の場合', () => {
        test('エラーメッセージを出力しない', async () => {
          const tokens = getEmbedList('example');

          for (const text of tokens) {
            const html = await markdownToHtml(text);
            expect(html).not.toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          }
        });
      });
    });
  });
});
