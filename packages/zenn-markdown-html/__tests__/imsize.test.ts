import { describe, test, expect } from 'vitest';
import markdownToHtml from '../src/index';
import { parse } from 'node-html-parser';

describe('画像サイズ指定（imsize）', () => {
  test('幅と高さを指定できる', async () => {
    const html = await markdownToHtml(
      '![alt text](https://example.com/image.png =100x200)'
    );
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('alt text');
    expect(img?.getAttribute('width')).toBe('100');
    expect(img?.getAttribute('height')).toBe('200');
  });

  test('幅のみ指定できる', async () => {
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png =300x)'
    );
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('width')).toBe('300');
    expect(img?.getAttribute('height')).toBeUndefined();
  });

  test('高さのみ指定できる', async () => {
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png =x150)'
    );
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('width')).toBeUndefined();
    expect(img?.getAttribute('height')).toBe('150');
  });

  test('タイトル付きで幅と高さを指定できる', async () => {
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png "image title" =100x200)'
    );
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('title')).toBe('image title');
    expect(img?.getAttribute('width')).toBe('100');
    expect(img?.getAttribute('height')).toBe('200');
  });

  test('パーセント指定ができる', async () => {
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png =50%x)'
    );
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('width')).toBe('50%');
  });

  test('サイズ指定なしの通常の画像も動作する', async () => {
    const html = await markdownToHtml('![alt](https://example.com/image.png)');
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(img?.getAttribute('alt')).toBe('alt');
    expect(img?.getAttribute('width')).toBeUndefined();
    expect(img?.getAttribute('height')).toBeUndefined();
  });

  test('幅・高さ両方にパーセント指定ができる', async () => {
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png =50%x30%)'
    );
    const img = parse(html).querySelector('img');

    expect(img?.getAttribute('width')).toBe('50%');
    expect(img?.getAttribute('height')).toBe('30%');
  });

  test('不正なフォーマット（xなし）はサイズ指定として認識されない', async () => {
    // =100200 は不正なフォーマットなので、URLの一部として扱われるか無視される
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png =100200)'
    );
    const img = parse(html).querySelector('img');

    // サイズが設定されていないことを確認
    expect(img?.getAttribute('width')).toBeUndefined();
    expect(img?.getAttribute('height')).toBeUndefined();
  });

  test('=の前にスペースがない場合はサイズ指定として認識されない', async () => {
    // "title"=100x200 のようにスペースがない場合
    const html = await markdownToHtml(
      '![alt](https://example.com/image.png "title"=100x200)'
    );
    const img = parse(html).querySelector('img');

    // パースに失敗するか、サイズが設定されない
    expect(img?.getAttribute('width')).toBeUndefined();
    expect(img?.getAttribute('height')).toBeUndefined();
  });

  test('複数の画像を含む場合も正しく処理される', async () => {
    const html = await markdownToHtml(
      '![first](https://example.com/1.png =100x200) text ![second](https://example.com/2.png =300x400)'
    );
    const imgs = parse(html).querySelectorAll('img');

    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute('width')).toBe('100');
    expect(imgs[0].getAttribute('height')).toBe('200');
    expect(imgs[1].getAttribute('width')).toBe('300');
    expect(imgs[1].getAttribute('height')).toBe('400');
  });
});
