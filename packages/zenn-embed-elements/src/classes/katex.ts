import { loadScript } from '../utils/load-script';
import { loadStylesheet } from '../utils/load-stylesheet';

declare let katex: any;

const containerId = 'katex-container';

/**
 * KaTeX数式をレンダリングするWeb Component
 *
 * ## 使用例
 * ```html
 * <embed-katex><eq>x^2 + y^2 = z^2</eq></embed-katex>
 * <embed-katex display-mode><eq>\frac{-b \pm \sqrt{b^2-4ac}}{2a}</eq></embed-katex>
 * ```
 *
 * ## MutationObserverについて
 *
 * morphdomなどのDOM差分更新ライブラリを使用する場合、既存のembed-katex要素の
 * 内容が更新されてもconnectedCallbackが発火しない。これにより、レンダリング済みの
 * 数式がrender前の状態（<eq>タグ）に戻されてしまう問題がある。
 *
 * MutationObserverで子要素の変更を監視し、未レンダリング状態を検出した場合に
 * 自動的にrender()を呼び出すことで、この問題を解決している。
 */
export class EmbedKatex extends HTMLElement {
  /** KaTeXレンダリング用の一時コンテナ */
  private _container: HTMLDivElement;
  /** DOM変更を監視するObserver */
  private _observer: MutationObserver | null = null;
  /** レンダリング中フラグ（無限ループ防止用） */
  private _isRendering: boolean = false;

  constructor() {
    super();
    const container = document.createElement('div');
    container.setAttribute('id', containerId);
    this._container = container;
  }

  async connectedCallback() {
    this.render();
    this._setupObserver();
  }

  disconnectedCallback() {
    this._cleanupObserver();
  }

  /**
   * MutationObserverをセットアップする
   *
   * 子要素の変更を監視し、morphdomなどによるDOM更新後に
   * 未レンダリング状態であればrender()を再実行する。
   */
  private _setupObserver() {
    if (this._observer) return;

    this._observer = new MutationObserver(() => {
      // render()がinnerHTMLを変更するとObserverが発火するため、
      // レンダリング中は無視して無限ループを防止する
      if (this._isRendering) return;

      // 未レンダリング状態の判定:
      // - インラインKaTeX: <eq>タグが存在する
      // - ブロックKaTeX: display-mode属性があり、firstElementChildが.katexでない
      //   （レンダリング済みの場合、firstElementChildは.katex要素になる）
      const hasEqTag = this.querySelector('eq');
      const isUnrenderedBlockKatex =
        this.hasAttribute('display-mode') &&
        !this.firstElementChild?.classList.contains('katex');

      if (hasEqTag || isUnrenderedBlockKatex) {
        this.render();
      }
    });

    this._observer.observe(this, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * MutationObserverをクリーンアップする（メモリリーク防止）
   */
  private _cleanupObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  async render() {
    if (this._isRendering) return;
    this._isRendering = true;

    try {
      if (typeof katex === 'undefined') {
        await loadScript({
          // 本来はバージョンを指定した方がいいが、他の処理との兼ね合いでバージョンを固定するのは難しいので指定していません
          src: `https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js`,
          id: 'katex-js',
        });
      }

      // CSSを読み込む（まだ読み込まれていない場合のみ）
      loadStylesheet({
        // 本来はバージョンを指定した方がいいが、他の処理との兼ね合いでバージョンを固定するのは難しいので指定していません
        href: `https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css`,
        id: `katex-css`,
      });

      const displayMode = !!this.getAttribute('display-mode');

      // detailsタグの中ではinnerTextがnullになることがあるため
      const content = this.textContent || this.innerText;
      katex?.render(content, this._container, {
        macros: { '\\RR': '\\mathbb{R}' },
        throwOnError: false,
        displayMode,
      });
      this.innerHTML = this._container.innerHTML;
    } finally {
      this._isRendering = false;
    }
  }
}
