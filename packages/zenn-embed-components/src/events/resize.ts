/**
 * 埋め込み要素のリサイズイベントで親ウィンドウに送信するデータ型
 */
export interface EmbedElementResizeEventData {
  id: string;
  width: number;
  height: number;
}

/**
 * 埋め込み要素のキャッシュストア
 */
const elementStore = new Map<string, HTMLIFrameElement[]>();

/**
 * JSON文字列をパースして返す
 */
const getJSONData = (data: string): Record<string, any> => {
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
  id: string,
  parent?: HTMLElement
): HTMLIFrameElement[] => {
  if (!id) return [];

  const root = parent || document;

  const elements =
    elementStore.get(id) ||
    Array.from(root.getElementsByTagName('iframe')).filter((iframe) => {
      return !!iframe.src && iframe.src.match(/id=(\w+)/)?.[1] === id;
    });

  if (elements.length > 0) {
    elementStore.set(id, elements);
  }

  return elements;
};

/**
 * 埋め込み要素からのリサイズイベントを購読する
 * @param allowOrigin 許可するOrigin
 * @param parent 埋め込み要素を表示している親要素
 */
export const listenEmbedComponentsResizeEvent = (
  allowOrigin: string[],
  parent?: HTMLElement
) => {
  const onMessage = (event: MessageEvent<any>) => {
    // 許可していないオリジンは受け付けないようにする
    if (!allowOrigin.includes(event.origin)) return;

    const { id, width, height } = getJSONData(event.data);

    if (!id) return;

    getEmbeddedIframes(id, parent).forEach((iframe) => {
      iframe.width = width || 0;
      iframe.height = height || 0;
    });

    console.log('Recived the postMessage data', { id, width, height });
  };

  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
  };
};
