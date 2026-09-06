// @vitest-environment jsdom
import { describe, test, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { BodyContent } from '../../components/BodyContent';
import { BodyContentWithToc } from '../../components/BodyContentWithToc';

afterEach(cleanup);

// zenn-markdown-html が出力する見出しと同じ構造
const heading = (id: string) =>
  `<h2 id="${id}"><a class="header-anchor-link" href="#${id}" aria-hidden="true"></a>${id}</h2>`;

describe('BodyContent', () => {
  test('同じ rawHtml で再レンダーしても本文の DOM ノードが作り直されない', () => {
    const html = heading('a');
    const { container, rerender } = render(<BodyContent rawHtml={html} />);
    const before = container.querySelector('h2');
    expect(before).not.toBeNull();

    rerender(<BodyContent rawHtml={html} />);

    expect(container.querySelector('h2')).toBe(before);
  });
});

describe('BodyContentWithToc', () => {
  test('同じ bodyHtml で再レンダーしても見出しのアンカーボタンが残る', () => {
    const html = heading('a');
    const { container, rerender } = render(
      <BodyContentWithToc bodyHtml={html} />
    );
    expect(container.querySelectorAll('h2 .anchor__button')).toHaveLength(1);

    rerender(<BodyContentWithToc bodyHtml={html} />);

    expect(container.querySelectorAll('h2 .anchor__button')).toHaveLength(1);
  });

  test('bodyHtml が変わったら新しい見出しにアンカーボタンが付く', () => {
    const { container, rerender } = render(
      <BodyContentWithToc bodyHtml={heading('a')} />
    );
    expect(container.querySelectorAll('h2 .anchor__button')).toHaveLength(1);

    rerender(<BodyContentWithToc bodyHtml={heading('b') + heading('c')} />);

    expect(container.querySelectorAll('h2 .anchor__button')).toHaveLength(2);
  });
});
