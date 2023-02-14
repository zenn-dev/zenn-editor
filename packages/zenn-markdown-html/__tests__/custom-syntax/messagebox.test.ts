import { parse } from 'node-html-parser';
import markdownToHtml from '../../src/index';

describe('メッセージボックスのカスタム記法テスト', () => {
  describe('通常表示の場合', () => {
    describe('正しい構文の場合', () => {
      test('htmlを出力する', () => {
        const html = markdownToHtml(':::message\nhello\n:::');
        const messagebox = parse(html).querySelector('aside.msg');
        const msgSymbol = messagebox?.querySelector('.msg-symbol');
        const msgContent = messagebox?.querySelector('.msg-content');

        expect(messagebox).not.toBe(null);
        expect(msgSymbol).not.toBe(null);
        expect(msgContent).not.toBe(null);
      });
    });

    describe('間違った構文の場合', () => {
      test('htmlを出力しない', () => {
        const html = markdownToHtml(':::message invalid"\nhello\n:::');
        const messagebox = parse(html).querySelector('aside.msg.alert');

        expect(messagebox).toBe(null);
      });
    });
  });

  describe('アラート表示の場合', () => {
    describe('正しい構文の場合', () => {
      test('htmlを出力する', () => {
        const validMarkdownPatterns = [
          ':::message alert\nhello\n:::',
          ':::message alert  \nhello\n:::',
          ':::message   alert  \nhello\n:::',
        ];
        validMarkdownPatterns.forEach((markdown) => {
          const html = markdownToHtml(markdown);
          const messagebox = parse(html).querySelector('aside.msg.alert');
          const msgSymbol = messagebox?.querySelector('.msg-symbol');
          const msgContent = messagebox?.querySelector('.msg-content');

          expect(messagebox).not.toBe(null);
          expect(msgSymbol).not.toBe(null);
          expect(msgContent).not.toBe(null);
        });
      });
    });

    describe('間違った構文の場合', () => {
      test('htmlを出力しない', () => {
        const html = markdownToHtml(':::message invalid"\nhello\n:::');
        const messagebox = parse(html).querySelector('aside.msg.alert');

        expect(messagebox).toBe(null);
      });
    });
  });
});
