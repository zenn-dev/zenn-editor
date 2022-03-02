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
const embedElementStore = new Map<string, HTMLIFrameElement>();

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
 * 渡された `id` を持つ埋め込み要素を返す
 * @param id 埋め込み要素の`id`に設定している文字列
 */
const getEmbeddedIframe = (id: string): HTMLIFrameElement | null => {
  const element = embedElementStore.get(id) || document.getElementById(id);

  if (!(element instanceof HTMLIFrameElement)) return null;

  embedElementStore.set(id, element);

  return element;
};

/**
 * 埋め込み要素からのリサイズイベントを購読する
 * @param allowOrigin 許可するOrigin
 */
export const listenEmbedComponentsResizeEvent = (allowOrigin: string[]) => {
  const onMessage = (event: MessageEvent<any>) => {
    // 許可していないオリジンは受け付けないようにする
    if (!allowOrigin.includes(event.origin)) return;

    const { id, width, height } = getJSONData(event.data);

    if (!id) return;

    const iframe = getEmbeddedIframe(id);

    if (iframe) {
      iframe.width = width || 0;
      iframe.height = height || 0;
    }

    console.log('Recived the postMessage data', { id, width, height });
  };

  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
  };
};
