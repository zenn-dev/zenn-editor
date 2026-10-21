type LoadScriptProps = {
  src: string;
  id: string;
  /** Subresource Integrity のハッシュ（例: `sha384-...`） */
  integrity?: string;
  /** integrity を検証するためにクロスオリジンのリソースでは指定が必要 */
  crossOrigin?: 'anonymous' | 'use-credentials';
};

const scriptLoadedStatusList: {
  [id: string]: boolean;
} = {};

export function loadScript({
  src,
  id,
  integrity,
  crossOrigin,
}: LoadScriptProps) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(id);
    if (existingScript) {
      // 既にscriptが読み込まれている場合は有効になるまで待機する
      const timer = setInterval(() => {
        if (scriptLoadedStatusList[id]) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    } else {
      // まだ読み込まれていない場合は新しく読み込む
      const script = document.createElement('script');
      if (integrity) script.setAttribute('integrity', integrity);
      if (crossOrigin) script.setAttribute('crossorigin', crossOrigin);
      script.setAttribute('src', src);
      script.setAttribute('id', id);
      script.onload = () => {
        scriptLoadedStatusList[id] = true;
        resolve();
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    }
  });
}
