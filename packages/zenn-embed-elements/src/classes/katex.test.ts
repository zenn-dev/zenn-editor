import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// loadScript と loadStylesheet をモック（CDNへのアクセスを防止）
vi.mock('../utils/load-script', () => ({
  loadScript: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/load-stylesheet', () => ({
  loadStylesheet: vi.fn(),
}));

import { EmbedKatex } from './katex';

// カスタム要素を登録
if (!customElements.get('embed-katex')) {
  customElements.define('embed-katex', EmbedKatex);
}

// KaTeXのモック
const mockKatexRender = vi.fn((content: string, container: HTMLElement) => {
  container.innerHTML = `<span class="katex">${content}</span>`;
});

// グローバルにkatexをモック
(globalThis as any).katex = {
  render: mockKatexRender,
};

describe('EmbedKatex', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockKatexRender.mockClear();
  });

  afterEach(() => {
    container.remove();
  });

  describe('connectedCallback', () => {
    it('DOMに追加されたときにrender()が呼ばれる', async () => {
      const element = document.createElement('embed-katex') as EmbedKatex;
      element.innerHTML = '<eq>a</eq>';

      container.appendChild(element);

      // 非同期処理を待つ
      await vi.waitFor(() => {
        expect(mockKatexRender).toHaveBeenCalled();
      });
    });

    it('数式の内容がKaTeXに渡される', async () => {
      const element = document.createElement('embed-katex') as EmbedKatex;
      element.innerHTML = '<eq>x^2</eq>';

      container.appendChild(element);

      await vi.waitFor(() => {
        expect(mockKatexRender).toHaveBeenCalledWith(
          'x^2',
          expect.any(HTMLElement),
          expect.objectContaining({ throwOnError: false })
        );
      });
    });

    it('display-mode属性が正しく渡される', async () => {
      // 前のテストの呼び出しをクリア
      mockKatexRender.mockClear();

      const element = document.createElement('embed-katex') as EmbedKatex;
      // 属性値を設定（空文字列だと!!''がfalseになるため）
      element.setAttribute('display-mode', 'true');
      element.innerHTML = '<eq>a</eq>';

      container.appendChild(element);

      await vi.waitFor(() => {
        // display-mode属性がtrueで渡されることを確認
        const calls = mockKatexRender.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[2].displayMode).toBe(true);
      });
    });
  });

  describe('MutationObserver', () => {
    it('子要素が変更されたときに再レンダリングされる', async () => {
      const element = document.createElement('embed-katex') as EmbedKatex;
      element.innerHTML = '<eq>a</eq>';
      container.appendChild(element);

      await vi.waitFor(() => {
        expect(mockKatexRender).toHaveBeenCalledTimes(1);
      });

      // 内容を変更（morphdomのシミュレーション）
      mockKatexRender.mockClear();
      element.innerHTML = '<eq>b</eq>';

      await vi.waitFor(() => {
        expect(mockKatexRender).toHaveBeenCalledWith(
          'b',
          expect.any(HTMLElement),
          expect.any(Object)
        );
      });
    });

    it('既にレンダリング済みの場合は再レンダリングしない', async () => {
      const element = document.createElement('embed-katex') as EmbedKatex;
      element.innerHTML = '<eq>a</eq>';
      container.appendChild(element);

      await vi.waitFor(() => {
        expect(mockKatexRender).toHaveBeenCalledTimes(1);
      });

      // レンダリング済み状態をシミュレート
      // （.katexクラスを持つ要素が存在する）
      mockKatexRender.mockClear();
      element.innerHTML = '<span class="katex">a</span>';

      // 少し待ってもrender()が呼ばれないことを確認
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockKatexRender).not.toHaveBeenCalled();
    });
  });

  describe('disconnectedCallback', () => {
    it('DOMから削除されたときにObserverがクリーンアップされる', async () => {
      const element = document.createElement('embed-katex') as EmbedKatex;
      element.innerHTML = '<eq>a</eq>';
      container.appendChild(element);

      await vi.waitFor(() => {
        expect(mockKatexRender).toHaveBeenCalledTimes(1);
      });

      // DOMから削除
      element.remove();

      // 削除後に内容を変更してもrender()が呼ばれないことを確認
      mockKatexRender.mockClear();
      element.innerHTML = '<eq>b</eq>';

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockKatexRender).not.toHaveBeenCalled();
    });
  });
});
