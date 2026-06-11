import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import {
  initFootnoteTooltip,
  _resetFootnoteTooltipStateForTest,
} from '../src/classes/footnote-tooltip';

// zenn-markdown-html が出力する脚注 HTML を再現したフィクスチャ
function setupContent() {
  document.body.innerHTML = `
    <div class="znc">
      <p>
        本文<sup class="footnote-ref"><a href="#fn-abcd-1" id="fnref-abcd-1">[1]</a></sup>
      </p>
      <section class="footnotes">
        <span class="footnotes-title">脚注</span>
        <ol class="footnotes-list">
          <li id="fn-abcd-1" class="footnote-item">
            <p>脚注の内容 <a href="https://example.com">出典</a>
              <a href="#fnref-abcd-1" class="footnote-backref">↩︎</a>
            </p>
          </li>
        </ol>
      </section>
    </div>
  `;
}

function getRef(): HTMLAnchorElement {
  return document.getElementById('fnref-abcd-1') as HTMLAnchorElement;
}

function getTooltipEl(): HTMLElement | null {
  return document.querySelector('#zenn-footnote-tooltip');
}

// jsdom は window.matchMedia を実装していないためスタブする
function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches } as unknown as MediaQueryList)
  );
}

function hoverRef() {
  getRef().dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
}

beforeEach(() => {
  vi.useFakeTimers();
  stubMatchMedia(true);
  _resetFootnoteTooltipStateForTest();
  setupContent();
  initFootnoteTooltip();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('表示', () => {
  test('mouseover から 150ms 後にツールチップが表示され、脚注の内容が入る', () => {
    hoverRef();
    // 表示遅延中はまだ表示されない（要素は遅延生成のため存在しない）
    expect(getTooltipEl()).toBeNull();

    vi.advanceTimersByTime(150);

    const tooltip = getTooltipEl();
    expect(tooltip).not.toBeNull();
    expect(tooltip!.hidden).toBe(false);
    expect(tooltip!.classList.contains('znc')).toBe(true);
    expect(tooltip!.getAttribute('role')).toBe('tooltip');
    expect(tooltip!.textContent).toContain('脚注の内容');
    expect(
      tooltip!.querySelector('a[href="https://example.com"]')
    ).not.toBeNull();
  });

  test('クローンされた内容から戻りリンク（.footnote-backref）が除去されている', () => {
    hoverRef();
    vi.advanceTimersByTime(150);

    expect(getTooltipEl()!.querySelector('.footnote-backref')).toBeNull();
    // 元の脚注セクションは変更されない
    expect(
      document.querySelector('.footnotes .footnote-backref')
    ).not.toBeNull();
  });

  test('表示中は参照リンクに aria-describedby が付与される', () => {
    hoverRef();
    vi.advanceTimersByTime(150);

    expect(getRef().getAttribute('aria-describedby')).toBe(
      'zenn-footnote-tooltip'
    );
  });
});
