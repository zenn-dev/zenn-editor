type LoadScriptProps = {
  src: string;
  id: string;
};

const scriptLoadedStatusList: {
  [id: string]: boolean;
} = {};

export function loadScript({ src, id }: LoadScriptProps) {
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
      script.setAttribute('src', src);
      script.setAttribute('id', id);
      document.head.appendChild(script);
      script.onload = () => {
        scriptLoadedStatusList[id] = true;
        resolve();
      };
      script.onerror = (e) => reject(e);
    }
  });
}
