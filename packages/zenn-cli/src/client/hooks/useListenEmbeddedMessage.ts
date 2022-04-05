import { useEffect } from 'react';

export type EmbeddedMessage =
  | {
      type: 'none';
      data: Record<string, never>;
    }
  | {
      type: 'rendering';
      data: {
        src: string | null | undefined;
      };
    }
  | {
      type: 'ready';
      data: {
        id: string;
      };
    }
  | {
      type: 'resize';
      data: {
        id: string;
        height: number;
      };
    };

const getEmbeddedMessage = (data: string): EmbeddedMessage => {
  try {
    const result = JSON.parse(data);

    if (typeof result.type !== 'string') throw new Error('Bad Request');
    if (typeof result.data !== 'object') throw new Error('Bad Request');

    return result;
  } catch {
    return { type: 'none', data: {} };
  }
};

/**
 * 埋め込み要素からの messaging を購読する。
 * これによって、埋め込み要素の高さがコンテンツと同じになります。
 */
export const useListenEmbeddedMessage = () => {
  useEffect(() => {
    let isReady = false;

    window.addEventListener('message', (event) => {
      const msg = getEmbeddedMessage(event.data);

      switch (msg.type) {
        case 'ready': {
          isReady = true;

          const iframe = document.getElementById(msg.data.id);

          if (!(iframe instanceof HTMLIFrameElement)) break;

          const newMsg: EmbeddedMessage = {
            type: 'rendering',
            data: {
              src: iframe?.getAttribute('data-content'),
            },
          };

          if (iframe.contentWindow && iframe.contentWindow.postMessage) {
            iframe.contentWindow.postMessage(JSON.stringify(newMsg), '*');
          }

          break;
        }

        case 'resize': {
          if (!isReady) break;

          const iframe = document.getElementById(msg.data.id);

          if (iframe instanceof HTMLIFrameElement) {
            iframe.height = `${msg.data.height || 0}`;
          }

          break;
        }
      }
    });
  }, []);
};
