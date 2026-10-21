import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  EmbedKatex,
  KATEX_CSS_HREF,
  KATEX_CSS_INTEGRITY,
  KATEX_JS_INTEGRITY,
  KATEX_JS_SRC,
  KATEX_VERSION,
} from '../src/classes/katex';

// KaTeX の出力を模したスタブ。実際の KaTeX と同様に、
// mathml・annotation・html の 3 箇所に数式テキストが含まれる
// （そのため textContent はソースの 3 倍になる）
function fakeKatexRender(src: string, el: HTMLElement) {
  el.innerHTML =
    '<span class="katex">' +
    `<span class="katex-mathml">${src}<annotation encoding="application/x-tex">${src}</annotation></span>` +
    `<span class="katex-html" aria-hidden="true">${src}</span>` +
    '</span>';
}

const renderSpy = vi.fn(fakeKatexRender);

if (!customElements.get('embed-katex')) {
  customElements.define('embed-katex', EmbedKatex);
}

beforeEach(() => {
  renderSpy.mockClear();
  vi.stubGlobal('katex', { render: renderSpy });
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function createEmbedKatex(source: string): HTMLElement {
  const el = document.createElement('embed-katex');
  const eq = document.createElement('eq');
  eq.className = 'zenn-katex';
  eq.textContent = source;
  el.appendChild(eq);
  return el;
}

// connectedCallback 内の render は async のためマイクロタスクを消化する
async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('EmbedKatex', () => {
  test('初回接続時に textContent をソースとしてレンダリングし、属性に保存する', async () => {
    const el = createEmbedKatex('e^{i\\pi} + 1 = 0');
    document.body.appendChild(el);
    await flush();

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy.mock.calls[0][0]).toBe('e^{i\\pi} + 1 = 0');
    expect(el.getAttribute('data-tex-source')).toBe('e^{i\\pi} + 1 = 0');
    expect(el.querySelector('.katex')).not.toBeNull();
  });

  test('レンダリング済み要素のクローンを再接続しても元のソースからレンダリングされる（増殖しない）', async () => {
    const el = createEmbedKatex('A');
    document.body.appendChild(el);
    await flush();

    // レンダリング済みの textContent はソースの 3 倍になっている
    expect(el.textContent).toBe('AAA');

    // 脚注ツールチップと同様に cloneNode で複製して再接続する
    const clone = el.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    await flush();

    expect(renderSpy).toHaveBeenCalledTimes(2);
    // 増殖した「AAA」ではなく、保存された元のソース「A」でレンダリングされる
    expect(renderSpy.mock.calls[1][0]).toBe('A');
    expect(clone.textContent).toBe('AAA');
  });

  test('display-mode 属性が displayMode オプションに反映される', async () => {
    const el = document.createElement('embed-katex');
    el.setAttribute('display-mode', '1');
    el.textContent = '\\frac{a}{b}';
    document.body.appendChild(el);
    await flush();

    expect(renderSpy.mock.calls[0][2]).toMatchObject({ displayMode: true });
  });

  test('KaTeX の CSS をバージョン固定・SRI 付きで読み込む', async () => {
    document.body.appendChild(createEmbedKatex('x'));
    await flush();

    const link = document.getElementById('katex-css');
    expect(link?.getAttribute('href')).toBe(KATEX_CSS_HREF);
    expect(link?.getAttribute('integrity')).toBe(KATEX_CSS_INTEGRITY);
    expect(link?.getAttribute('crossorigin')).toBe('anonymous');
  });

  test('katex が未定義の場合は JS をバージョン固定・SRI 付きで読み込んでからレンダリングする', async () => {
    vi.stubGlobal('katex', undefined);
    document.body.appendChild(createEmbedKatex('y'));
    await flush();

    const script = document.getElementById('katex-js') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.getAttribute('src')).toBe(KATEX_JS_SRC);
    expect(script.getAttribute('integrity')).toBe(KATEX_JS_INTEGRITY);
    expect(script.getAttribute('crossorigin')).toBe('anonymous');
    expect(renderSpy).not.toHaveBeenCalled();

    // スクリプトの読み込み完了を模擬する
    vi.stubGlobal('katex', { render: renderSpy });
    script.onload?.(new Event('load'));
    await flush();

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy.mock.calls[0][0]).toBe('y');
  });
});

describe('KaTeX の CDN 設定', () => {
  test('exact version を指定し、sha384 の SRI ハッシュを持つ', () => {
    expect(KATEX_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(KATEX_JS_SRC).toBe(
      `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`
    );
    expect(KATEX_CSS_HREF).toBe(
      `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`
    );
    expect(KATEX_JS_INTEGRITY).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
    expect(KATEX_CSS_INTEGRITY).toMatch(/^sha384-[A-Za-z0-9+/]{64}$/);
  });
});
