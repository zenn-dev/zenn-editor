/**
 * 埋め込み要素のキャッシュストア
 */
const elementStore = new Map<string, HTMLIFrameElement[]>();

const getJSON = (data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

/**
 * 渡された `src` を表示している埋め込み要素を返す
 * @param src 埋め込み要素に設定されている `src` 文字列
 * @param parent 埋め込み要素を表示している親要素
 */
const getEmbeddedIframes = (
  src: string,
  parent?: HTMLElement
): HTMLIFrameElement[] => {
  if (!src) return [];

  const root = parent || document;

  const elements =
    elementStore.get(src) ||
    Array.from(root.querySelectorAll(`iframe[src='${src}']`));

  if (elements.length > 0) {
    elementStore.set(src, elements);
  }

  return elements;
};

/**
 * 表示している埋め込み要素のリサイズイベントを設定する関数
 * @param allowOrigin 許可するOrigin
 * @param parent 埋め込み要素を表示している親要素
 */
export const setupEmbedComponentsResizeEvent = (
  allowOrigin: string[],
  parent?: HTMLElement
) => {
  const onMessage = (event: MessageEvent<any>) => {
    // 許可していないオリジンは受け付けないようにする
    if (!allowOrigin.includes(event.origin)) return;

    const { src, width, height } = getJSON(event.data);

    if (width && height) {
      getEmbeddedIframes(src, parent).forEach((iframe) => {
        iframe.width = width;
        iframe.height = width;
      });
    }
    console.log('Recived the postMessage data', { src, width, height });
  };

  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
  };
};
