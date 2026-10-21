import { describe, test, expect, beforeEach } from 'vitest';
import { loadScript } from '../src/utils/load-script';
import { loadStylesheet } from '../src/utils/load-stylesheet';

beforeEach(() => {
  document.head.innerHTML = '';
});

describe('loadScript', () => {
  test('integrity と crossOrigin を指定すると script 要素に付与される', async () => {
    const promise = loadScript({
      src: 'https://example.com/a.js',
      id: 'test-script-sri',
      integrity: 'sha384-abc',
      crossOrigin: 'anonymous',
    });
    const script = document.getElementById(
      'test-script-sri'
    ) as HTMLScriptElement;
    expect(script.getAttribute('src')).toBe('https://example.com/a.js');
    expect(script.getAttribute('integrity')).toBe('sha384-abc');
    expect(script.getAttribute('crossorigin')).toBe('anonymous');

    script.onload?.(new Event('load'));
    await expect(promise).resolves.toBeUndefined();
  });

  test('integrity と crossOrigin を省略すると属性は付与されない', () => {
    void loadScript({ src: 'https://example.com/b.js', id: 'test-script' });
    const script = document.getElementById('test-script') as HTMLScriptElement;
    expect(script.hasAttribute('integrity')).toBe(false);
    expect(script.hasAttribute('crossorigin')).toBe(false);
  });

  test('読み込みに失敗すると reject される', async () => {
    const promise = loadScript({
      src: 'https://example.com/c.js',
      id: 'test-script-error',
      integrity: 'sha384-mismatch',
      crossOrigin: 'anonymous',
    });
    const script = document.getElementById(
      'test-script-error'
    ) as HTMLScriptElement;
    script.onerror?.(new Event('error'));
    await expect(promise).rejects.toBeInstanceOf(Event);
  });
});

describe('loadStylesheet', () => {
  test('integrity と crossOrigin を指定すると link 要素に付与される', async () => {
    const promise = loadStylesheet({
      href: 'https://example.com/a.css',
      id: 'test-css-sri',
      integrity: 'sha384-def',
      crossOrigin: 'anonymous',
    });
    const link = document.getElementById('test-css-sri') as HTMLLinkElement;
    expect(link.getAttribute('href')).toBe('https://example.com/a.css');
    expect(link.getAttribute('rel')).toBe('stylesheet');
    expect(link.getAttribute('integrity')).toBe('sha384-def');
    expect(link.getAttribute('crossorigin')).toBe('anonymous');

    link.onload?.(new Event('load'));
    await expect(promise).resolves.toBeUndefined();
  });

  test('integrity と crossOrigin を省略すると属性は付与されない', () => {
    void loadStylesheet({ href: 'https://example.com/b.css', id: 'test-css' });
    const link = document.getElementById('test-css') as HTMLLinkElement;
    expect(link.hasAttribute('integrity')).toBe(false);
    expect(link.hasAttribute('crossorigin')).toBe(false);
  });

  test('同じ id の link が既にある場合は追加せずに resolve する', async () => {
    void loadStylesheet({ href: 'https://example.com/d.css', id: 'test-dup' });
    await expect(
      loadStylesheet({ href: 'https://example.com/d.css', id: 'test-dup' })
    ).resolves.toBeUndefined();
    expect(document.head.querySelectorAll('#test-dup')).toHaveLength(1);
  });
});
