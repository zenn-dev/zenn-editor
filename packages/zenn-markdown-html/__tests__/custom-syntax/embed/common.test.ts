import markdownToHtml from '../../../src';

describe('Common Tests for Embedded Elements', () => {
  describe('Validation Testing of Embedded Elements', () => {
    describe('Notation with character limit', () => {
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

      describe('If the URL or Token is longer than 300 characters', () => {
        test('should output error message', () => {
          const dummy = Array(301).fill('a').join('');
          const tokens = getRestrictedEmbedList(dummy);

          tokens.forEach((text) => {
            const html = markdownToHtml(text);
            expect(html).toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          });
        });
      });

      describe('If the URL or Token is less than 300 characters', () => {
        test('should not output error message', () => {
          const tokens = getRestrictedEmbedList('example');
          tokens.forEach((text) => {
            const html = markdownToHtml(text);
            expect(html).not.toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          });
        });
      });
    });

    describe('Notation with no character limit', () => {
      const getEmbedList = (token: string) => [
        // linkify
        `https://zenn.dev/${token}`,
        `https://github.com/zenn-dev/zenn-editor/blob/canary/${token}`,

        // custom
        `@[card](http://youtu.be/${token})`,
        `@[github](https://github.com/zenn-dev/zenn-editor/blob/canary/${token})`,
      ];

      describe('If the URL or Token is longer than 300 characters', () => {
        test('should not output error message', () => {
          const dummy = Array(350).fill('a').join('');
          const tokens = getEmbedList(dummy);

          tokens.forEach((text) => {
            const html = markdownToHtml(text);
            expect(html).not.toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          });
        });
      });

      describe('If the URL or Token is less than 300 characters', () => {
        test('should not output error message', () => {
          const tokens = getEmbedList('example');

          tokens.forEach((text) => {
            const html = markdownToHtml(text);
            expect(html).not.toContain(
              '埋め込みURLは300文字以内にする必要があります'
            );
          });
        });
      });
    });
  });
});
