import { useEffect } from 'react';

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

export const useListenEmbedResize = (allowOrigin: string[]) => {
  useEffect(() => {
    const onMessage = (event: MessageEvent<any>) => {
      // 許可していないオリジンは受け付けないようにする
      if (!allowOrigin.includes(event.origin)) return;

      const { id, height } = getJSONData(event.data);

      if (!id) return;

      const iframe = document.getElementById(id);

      if (iframe instanceof HTMLIFrameElement) {
        iframe.height = height || 0;
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);
};
