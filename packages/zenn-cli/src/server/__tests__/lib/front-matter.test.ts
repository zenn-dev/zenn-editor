import { describe, test, expect, afterEach } from 'vitest';
import { parseFrontMatter } from '../../lib/front-matter';

declare global {
  var __frontMatterExecuted: boolean | undefined;
}

describe('parseFrontMatter() のテスト', () => {
  describe('YAML の front matter', () => {
    test('front matter と本文を分離する', () => {
      const raw = '---\ntitle: "Hello"\nfree: true\n---\n本文\n';
      expect(parseFrontMatter(raw)).toEqual({
        data: { title: 'Hello', free: true },
        content: '本文\n',
      });
    });

    test('CRLF の改行でも分離できる', () => {
      const raw = '---\r\ntitle: Hello\r\n---\r\n本文\r\n';
      expect(parseFrontMatter(raw)).toEqual({
        data: { title: 'Hello' },
        content: '本文\r\n',
      });
    });

    test('先頭の BOM を取り除く', () => {
      const raw = '﻿---\ntitle: Hello\n---\n本文';
      expect(parseFrontMatter(raw)).toEqual({
        data: { title: 'Hello' },
        content: '本文',
      });
    });

    test('JSON_SCHEMA で解析し、日付などを文字列のまま残す', () => {
      const raw =
        '---\npublished_at: 2022-05-27\ntitle: 2024-01-01\nfree: True\nemoji: ~\n---\n';
      expect(parseFrontMatter(raw).data).toEqual({
        published_at: '2022-05-27',
        title: '2024-01-01',
        free: 'True',
        emoji: '~',
      });
    });

    test('front matter が空なら data は空オブジェクト', () => {
      expect(parseFrontMatter('---\n---\n本文')).toEqual({
        data: {},
        content: '本文',
      });
    });

    test('front matter がコメントだけなら data は空オブジェクト', () => {
      expect(parseFrontMatter('---\n# comment\n---\n本文')).toEqual({
        data: {},
        content: '本文',
      });
    });

    test('front matter がオブジェクトでなければ data は空オブジェクト', () => {
      expect(parseFrontMatter('---\nfoo\n---\n本文')).toEqual({
        data: {},
        content: '本文',
      });
    });

    test('閉じの区切りがなければ残り全体を front matter とする', () => {
      expect(parseFrontMatter('---\ntitle: Hello\n')).toEqual({
        data: { title: 'Hello' },
        content: '',
      });
    });

    test('YAML として不正なら例外を投げる', () => {
      expect(() => parseFrontMatter('---\ndup: 1\ndup: 2\n---\n')).toThrow();
    });
  });

  describe('front matter がない場合', () => {
    test('空文字', () => {
      expect(parseFrontMatter('')).toEqual({ data: {}, content: '' });
    });

    test('区切りで始まらない場合はファイル全体を本文とする', () => {
      const raw = '# 見出し\n---\ntitle: Hello\n---\n';
      expect(parseFrontMatter(raw)).toEqual({ data: {}, content: raw });
    });

    test('---- で始まる場合はファイル全体を本文とする', () => {
      const raw = '----\ntitle: Hello\n----\n';
      expect(parseFrontMatter(raw)).toEqual({ data: {}, content: raw });
    });
  });

  describe('区切りの後ろに言語名がある場合', () => {
    afterEach(() => {
      delete globalThis.__frontMatterExecuted;
    });

    test.each(['js', 'javascript', 'json', 'yaml', 'yml', 'coffee', ' js'])(
      '---%s はコードを実行せず、ファイル全体を本文とする',
      (language) => {
        const raw = `---${language}\n{ title: (globalThis.__frontMatterExecuted = true, "pwned") }\n---\n本文`;
        expect(parseFrontMatter(raw)).toEqual({ data: {}, content: raw });
        expect(globalThis.__frontMatterExecuted).toBeUndefined();
      }
    );

    test('区切りの後ろが空白だけなら言語名なしとして扱う', () => {
      expect(parseFrontMatter('---  \ntitle: Hello\n---\n本文')).toEqual({
        data: { title: 'Hello' },
        content: '本文',
      });
    });
  });
});
