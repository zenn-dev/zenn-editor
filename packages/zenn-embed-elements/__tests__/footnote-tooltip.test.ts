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

describe('非表示', () => {
  test('参照リンクから離れて 300ms 後に非表示になり aria-describedby も除去される', () => {
    hoverRef();
    vi.advanceTimersByTime(150);
    getRef().dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

    vi.advanceTimersByTime(299);
    expect(getTooltipEl()!.hidden).toBe(false);

    vi.advanceTimersByTime(1);
    expect(getTooltipEl()!.hidden).toBe(true);
    expect(getRef().hasAttribute('aria-describedby')).toBe(false);
  });

  test('表示遅延の経過前にマウスが離れた場合は表示されない', () => {
    hoverRef();
    getRef().dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()).toBeNull();
  });

  test('ツールチップ上にマウスがある間は表示が維持され、離れたら遅延後に消える', () => {
    hoverRef();
    vi.advanceTimersByTime(150);
    getRef().dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    // mouseenter はバブリングしないが、リスナーはツールチップ要素に直接付いている
    getTooltipEl()!.dispatchEvent(new MouseEvent('mouseenter'));

    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()!.hidden).toBe(false);

    getTooltipEl()!.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(300);
    expect(getTooltipEl()!.hidden).toBe(true);
  });

  test('Esc キーで即時に閉じる', () => {
    hoverRef();
    vi.advanceTimersByTime(150);

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    expect(getTooltipEl()!.hidden).toBe(true);
  });

  test('表示遅延中に Esc を押すと表示の予約がキャンセルされる', () => {
    hoverRef();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );

    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()).toBeNull();
  });
});
