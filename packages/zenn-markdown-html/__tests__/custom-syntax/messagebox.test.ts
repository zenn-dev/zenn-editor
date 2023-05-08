import { parse } from 'node-html-parser';
import markdownToHtml from '../../src/index';

describe('Custom Notation Testing for Message Boxes', () => {
  describe('Normal display', () => {
    describe('For correct syntax', () => {
      test('should html be output', () => {
        const html = markdownToHtml(':::message\nhello\n:::');
        const messagebox = parse(html).querySelector('aside.msg');
        const msgSymbol = messagebox?.querySelector('.msg-symbol');
        const msgContent = messagebox?.querySelector('.msg-content');

        expect(messagebox).not.toBe(null);
        expect(msgSymbol).not.toBe(null);
        expect(msgContent).not.toBe(null);
      });
    });

    describe('For incorrect syntax', () => {
      test('should not html be output', () => {
        const html = markdownToHtml(':::message invalid"\nhello\n:::');
        const messagebox = parse(html).querySelector('aside.msg.alert');

        expect(messagebox).toBe(null);
      });
    });
  });

  describe('For alert display', () => {
    describe('For correct syntax', () => {
      test('should html be output', () => {
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

    describe('For incorrect syntax', () => {
      test('should not html be output', () => {
        const html = markdownToHtml(':::message invalid"\nhello\n:::');
        const messagebox = parse(html).querySelector('aside.msg.alert');

        expect(messagebox).toBe(null);
      });
    });
  });
});
