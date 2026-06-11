const TOOLTIP_ID = 'zenn-footnote-tooltip';
const SHOW_DELAY_MS = 150;
const HIDE_DELAY_MS = 300;

let initialized = false;
let tooltip: HTMLDivElement | null = null;
let currentRef: HTMLAnchorElement | null = null;
let showTimerId: number | undefined;
let hideTimerId: number | undefined;

function cancelShowTimer() {
  if (showTimerId !== undefined) {
    window.clearTimeout(showTimerId);
    showTimerId = undefined;
  }
}

function cancelHideTimer() {
  if (hideTimerId !== undefined) {
    window.clearTimeout(hideTimerId);
    hideTimerId = undefined;
  }
}

function getTooltip(): HTMLDivElement {
  // SPA のページ遷移等で body ごと差し替えられた場合は作り直す
  if (tooltip && tooltip.isConnected) return tooltip;
  tooltip = document.createElement('div');
  tooltip.id = TOOLTIP_ID;
  // znc クラスを付けることで CSS 変数とコンテンツスタイルを継承する
  tooltip.className = 'znc zenn-footnote-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  tooltip.addEventListener('mouseenter', () => cancelHideTimer());
  tooltip.addEventListener('mouseleave', () => scheduleHide());
  document.body.appendChild(tooltip);
  return tooltip;
}

function findFootnoteRef(
  target: EventTarget | null
): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const ref = target.closest('sup.footnote-ref > a');
  if (!(ref instanceof HTMLAnchorElement)) return null;
  // コンテンツ領域（.znc）内の脚注参照のみ対象にする
  if (!ref.closest('.znc')) return null;
  return ref;
}

function getFootnoteContent(ref: HTMLAnchorElement): DocumentFragment | null {
  const id = decodeURIComponent(ref.hash.slice(1));
  if (!id) return null;
  const item = document.getElementById(id);
  if (!item || !item.classList.contains('footnote-item')) return null;

  const fragment = document.createDocumentFragment();
  item.childNodes.forEach((node) => {
    fragment.appendChild(node.cloneNode(true));
  });
  // 「↩︎」戻りリンクはツールチップ内では不要
  fragment.querySelectorAll('.footnote-backref').forEach((el) => el.remove());

  if (!fragment.textContent?.trim()) return null;
  return fragment;
}

function positionTooltip(tip: HTMLDivElement, ref: HTMLAnchorElement) {
  const margin = 8;
  const refRect = ref.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();

  let left = refRect.left + refRect.width / 2 - tipRect.width / 2;
  left = Math.min(
    Math.max(margin, left),
    window.innerWidth - tipRect.width - margin
  );

  // 基本は参照リンクの上側。収まらない場合は下側に反転する
  let top = refRect.top - tipRect.height - margin;
  if (top < margin) {
    top = refRect.bottom + margin;
  }

  tip.style.left = `${left + window.scrollX}px`;
  tip.style.top = `${top + window.scrollY}px`;
}

function show(ref: HTMLAnchorElement) {
  const content = getFootnoteContent(ref);
  if (!content) return;
  hideNow();
  const tip = getTooltip();
  tip.replaceChildren(content);
  tip.hidden = false;
  positionTooltip(tip, ref);
  ref.setAttribute('aria-describedby', TOOLTIP_ID);
  currentRef = ref;
}

function hideNow() {
  cancelShowTimer();
  cancelHideTimer();
  if (currentRef) {
    currentRef.removeAttribute('aria-describedby');
    currentRef = null;
  }
  if (tooltip) {
    tooltip.hidden = true;
  }
}

function scheduleHide() {
  cancelHideTimer();
  hideTimerId = window.setTimeout(hideNow, HIDE_DELAY_MS);
}

function onMouseOver(event: MouseEvent) {
  const ref = findFootnoteRef(event.target);
  if (!ref) return;
  // タッチのみのデバイスでは従来のジャンプ動作のままにする
  if (!window.matchMedia('(hover: hover)').matches) return;
  cancelHideTimer();
  if (ref === currentRef) return;
  cancelShowTimer();
  showTimerId = window.setTimeout(() => show(ref), SHOW_DELAY_MS);
}

function onMouseOut(event: MouseEvent) {
  const ref = findFootnoteRef(event.target);
  if (!ref) return;
  cancelShowTimer();
  if (ref === currentRef) scheduleHide();
}

function onFocusIn(event: FocusEvent) {
  const ref = findFootnoteRef(event.target);
  if (!ref) return;
  cancelHideTimer();
  if (ref === currentRef) return;
  // キーボード利用者には遅延なしで表示する
  show(ref);
}

function onFocusOut(event: FocusEvent) {
  // 参照リンクまたはツールチップ内からのフォーカス喪失のみ対象にする
  const fromRef = findFootnoteRef(event.target) !== null;
  const fromTooltip =
    event.target instanceof Node && !!tooltip && tooltip.contains(event.target);
  if (!fromRef && !fromTooltip) return;
  const next = event.relatedTarget;
  // フォーカス移動先がツールチップ内または参照リンクなら表示を維持する
  if (next instanceof Node && tooltip && tooltip.contains(next)) return;
  if (findFootnoteRef(next)) return;
  hideNow();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  // 表示遅延中なら表示の予約ごと取り消す
  cancelShowTimer();
  if (tooltip && !tooltip.hidden) hideNow();
}

export function initFootnoteTooltip() {
  if (initialized) return;
  if (typeof document === 'undefined') return;
  initialized = true;
  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('keydown', onKeyDown);
}

// テスト用: モジュール内部の状態をリセットする（リスナーの登録は維持される）
export function _resetFootnoteTooltipStateForTest() {
  hideNow();
  tooltip = null;
}
