import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
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
  vi.restoreAllMocks();
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

describe('キーボードフォーカス', () => {
  test('focusin で（遅延なしで）即時表示される', () => {
    getRef().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    const tooltip = getTooltipEl();
    expect(tooltip).not.toBeNull();
    expect(tooltip!.hidden).toBe(false);
    expect(tooltip!.textContent).toContain('脚注の内容');
  });

  test('focusout で非表示になる', () => {
    getRef().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    getRef().dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.body,
      })
    );

    expect(getTooltipEl()!.hidden).toBe(true);
  });

  test('フォーカスがツールチップ内へ移った場合は表示を維持する', () => {
    getRef().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    const linkInTooltip = getTooltipEl()!.querySelector('a')!;
    getRef().dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: linkInTooltip,
      })
    );

    expect(getTooltipEl()!.hidden).toBe(false);
  });

  test('ツールチップ内のリンクからさらに外へフォーカスが移ると閉じる', () => {
    getRef().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    const linkInTooltip = getTooltipEl()!.querySelector('a')!;
    getRef().dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: linkInTooltip,
      })
    );

    linkInTooltip.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.body,
      })
    );

    expect(getTooltipEl()!.hidden).toBe(true);
  });

  test('ツールチップ内から参照リンクへフォーカスが戻った場合は表示を維持する', () => {
    getRef().dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    const linkInTooltip = getTooltipEl()!.querySelector('a')!;
    getRef().dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: linkInTooltip,
      })
    );

    linkInTooltip.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: getRef() })
    );

    expect(getTooltipEl()!.hidden).toBe(false);
  });
});

describe('ガード条件', () => {
  test('参照先の脚注が存在しない場合は何も起きない', () => {
    document.getElementById('fn-abcd-1')!.remove();

    hoverRef();
    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()).toBeNull();
  });

  test('脚注の内容が空（戻りリンクのみ）の場合は表示されない', () => {
    document.getElementById('fn-abcd-1')!.innerHTML =
      '<a href="#fnref-abcd-1" class="footnote-backref">↩︎</a>';

    hoverRef();
    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()).toBeNull();
  });

  test('ホバー不可のデバイス（hover: none）では mouseover で表示されない', () => {
    stubMatchMedia(false);

    hoverRef();
    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()).toBeNull();
  });

  test('href のハッシュが不正なパーセントエンコードでも例外を投げず何も起きない', () => {
    getRef().setAttribute('href', '#fn-%zz');

    expect(() => {
      hoverRef();
      vi.advanceTimersByTime(1000);
    }).not.toThrow();
    expect(getTooltipEl()).toBeNull();
  });

  test('.znc 外の同形マークアップには反応しない', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div><sup class="footnote-ref"><a href="#fn-abcd-1" id="fnref-outside">[1]</a></sup></div>'
    );

    document
      .getElementById('fnref-outside')!
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(getTooltipEl()).toBeNull();
  });

  test('表示中に別の参照リンクへ移動すると内容が切り替わる', () => {
    // 2 つ目の脚注を追加する
    document
      .querySelector('.znc > p')!
      .insertAdjacentHTML(
        'beforeend',
        '<sup class="footnote-ref"><a href="#fn-abcd-2" id="fnref-abcd-2">[2]</a></sup>'
      );
    document
      .querySelector('.footnotes-list')!
      .insertAdjacentHTML(
        'beforeend',
        '<li id="fn-abcd-2" class="footnote-item"><p>2つ目の脚注</p></li>'
      );

    // ref1 を表示
    hoverRef();
    vi.advanceTimersByTime(150);
    expect(getTooltipEl()!.textContent).toContain('脚注の内容');

    // 実ブラウザの発火順: ref1 の mouseout → ref2 の mouseover
    getRef().dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    document
      .getElementById('fnref-abcd-2')!
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    vi.advanceTimersByTime(150);
    expect(getTooltipEl()!.hidden).toBe(false);
    expect(getTooltipEl()!.textContent).toContain('2つ目の脚注');
    expect(getTooltipEl()!.textContent).not.toContain('脚注の内容');

    // aria-describedby は新しい ref に付け替わっている
    expect(getRef().hasAttribute('aria-describedby')).toBe(false);
    expect(
      document.getElementById('fnref-abcd-2')!.getAttribute('aria-describedby')
    ).toBe('zenn-footnote-tooltip');
  });
});

describe('埋め込み要素を含む脚注', () => {
  function setFootnoteContent(html: string) {
    document.getElementById('fn-abcd-1')!.innerHTML = html;
  }

  test('リンクカード（data-content が URL）はテキストリンクに置換される', () => {
    setFootnoteContent(
      '<p><span class="embed-block zenn-embedded zenn-embedded-card">' +
        '<iframe id="zenn-embedded__aaa" src="https://embed.zenn.studio/card#zenn-embedded__aaa" ' +
        'data-content="https%3A%2F%2Fexample.com%2Farticle" frameborder="0" scrolling="no"></iframe>' +
        '</span>' +
        '<a href="#fnref-abcd-1" class="footnote-backref">↩︎</a></p>'
    );

    hoverRef();
    vi.advanceTimersByTime(150);

    const tooltip = getTooltipEl()!;
    expect(tooltip.hidden).toBe(false);
    expect(tooltip.querySelector('iframe')).toBeNull();
    const link = tooltip.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('https://example.com/article');
    expect(link.textContent).toBe('https://example.com/article');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer noopener nofollow');
    // 元の脚注セクションは変更されない
    expect(
      document.querySelector('.footnotes .footnote-item iframe')
    ).not.toBeNull();
  });

  test('data-content が URL でない埋め込み（mermaid 等）は脚注へのリンクに置換される', () => {
    setFootnoteContent(
      '<p><span class="embed-block zenn-embedded zenn-embedded-mermaid">' +
        '<iframe id="zenn-embedded__bbb" src="https://embed.zenn.studio/mermaid#zenn-embedded__bbb" ' +
        'data-content="graph%20TD%3BA--%3EB%3B" frameborder="0" scrolling="no"></iframe>' +
        '</span></p>'
    );

    hoverRef();
    vi.advanceTimersByTime(150);

    const tooltip = getTooltipEl()!;
    expect(tooltip.hidden).toBe(false);
    expect(tooltip.querySelector('iframe')).toBeNull();
    const link = tooltip.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#fn-abcd-1');
    expect(link.textContent).toBe('埋め込みコンテンツ');
  });

  test('data-content を持たない埋め込み（YouTube 等）は脚注へのリンクに置換される', () => {
    setFootnoteContent(
      '<p><span class="embed-block embed-youtube">' +
        '<iframe src="https://www.youtube-nocookie.com/embed/XXXX" allowfullscreen loading="lazy"></iframe>' +
        '</span></p>'
    );

    hoverRef();
    vi.advanceTimersByTime(150);

    const tooltip = getTooltipEl()!;
    expect(tooltip.hidden).toBe(false);
    expect(tooltip.querySelector('iframe')).toBeNull();
    const link = tooltip.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('#fn-abcd-1');
    expect(link.textContent).toBe('埋め込みコンテンツ');
  });
});

describe('位置調整', () => {
  // jsdom はレイアウトを持たないため getBoundingClientRect をモックする
  function mockRects(refRect: Partial<DOMRect>, tipRect: Partial<DOMRect>) {
    const original = Element.prototype.getBoundingClientRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: Element) {
        if (this.id === 'fnref-abcd-1') return refRect as DOMRect;
        if (this.id === 'zenn-footnote-tooltip') return tipRect as DOMRect;
        return original.call(this);
      }
    );
  }

  test('上下どちらにも収まらない場合はビューポート下端にクランプされる', () => {
    vi.stubGlobal('innerHeight', 600);
    vi.stubGlobal('innerWidth', 1000);
    // 参照リンクは上から 290px（上に 300px のツールチップは入らない）、
    // 下側に出すと 306 + 8 + 300 = 614 > 600 で下端からはみ出す
    mockRects(
      { top: 290, bottom: 306, left: 500, width: 16, height: 16 },
      { top: 0, bottom: 0, left: 0, width: 300, height: 300 }
    );

    hoverRef();
    vi.advanceTimersByTime(150);

    // クランプ後: 600 - 300 - 8 = 292px
    expect(getTooltipEl()!.style.top).toBe('292px');
  });

  test('下側に収まる場合は従来どおり参照リンクの直下に表示される', () => {
    vi.stubGlobal('innerHeight', 600);
    vi.stubGlobal('innerWidth', 1000);
    // 上には入らないが下には収まるケース
    mockRects(
      { top: 50, bottom: 66, left: 500, width: 16, height: 16 },
      { top: 0, bottom: 0, left: 0, width: 300, height: 100 }
    );

    hoverRef();
    vi.advanceTimersByTime(150);

    // 下側反転: 66 + 8 = 74px（クランプの影響を受けない）
    expect(getTooltipEl()!.style.top).toBe('74px');
  });
});
