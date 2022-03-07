/**
 * 埋め込み要素のリサイズイベントで親ウィンドウに送信するデータ型
 */
export interface EmbedElementResizeEventData {
  id: string;
  width: number;
  height: number;
}

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
 * 埋め込み要素からのリサイズイベントを購読する
 * @param allowOrigin 許可するOrigin
 */
export const listenEmbedComponentsResizeEvent = (allowOrigin: string[]) => {
  const onMessage = (event: MessageEvent<any>) => {
    // 許可していないオリジンは受け付けないようにする
    if (!allowOrigin.includes(event.origin)) return;

    const { id, width, height } = getJSONData(event.data);

    if (!id) return;

    const iframe = document.getElementById(id);

    if (iframe instanceof HTMLIFrameElement) {
      iframe.width = width || 0;
      iframe.height = height || 0;
    }
  };

  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener('message', onMessage);
  };
};
