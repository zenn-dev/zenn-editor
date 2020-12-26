/**
 * 本当はJSONPを使いたくないが、Gistのjsonファイル（https://gist.github.com/foo/bar.json）への
 * リクエストでCORSを回避するにはJSONPしか無さそう
 *
 * 他に検討した方法
 * - Gistのscriptをcomponent内で非同期に読み込むことはセキュリティ的に不可能（document.writeが使われているため）
 * - iframeだと高さの調整が必要になって面倒
 * - Gistが読まれるたびに初期化処理を呼び出すのはアプリ側の処理がややこしい
 * => JSONP!!!
 *
 * ref: https://github.com/moebiusmania/gist-embed
 */

const head = document.getElementsByTagName('head')[0];
const timeout = 6000;
let timeoutId: NodeJS.Timeout | null = null;

function resetTimeout() {
  if (timeoutId) clearTimeout(timeoutId);
}

const clearFunction = (callbackName: string, callbackId: string) => {
  try {
    delete (window as any)[callbackName];
  } catch (e) {
    (window as any)[callbackName] = undefined;
  }
  const script = document.getElementById(callbackId);
  if (script) {
    head.removeChild(script);
  }
};

export function getByJsonp<T>(url: string): Promise<T> {
  const callbackName = `jsonp_${Date.now()}_${Math.ceil(
    Math.random() * 10000
  )}`;
  const callbackId = `id_${callbackName}`;

  return new Promise((resolve, reject) => {
    (window as any)[callbackName] = (response: T) => {
      resolve(response);
      resetTimeout();
      clearFunction(callbackName, callbackId);
    };

    // すでにクエリが付与されている場合は "&" で、付与されていない場合は "?" でcallbackを指定する
    const src =
      url + (url.includes('?') ? '&' : '?') + `callback=${callbackName}`;

    const script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute('charset', 'UTF-8');
    script.id = callbackId;
    head.appendChild(script);

    timeoutId = setTimeout(() => {
      reject(new Error(`Request to ${url} timed out.`));
      clearFunction(callbackName, callbackId);
      (window as any)[callbackName] = () =>
        clearFunction(callbackName, callbackId);
    }, timeout);

    // Catch errors
    script.addEventListener('error', () => {
      reject(new Error(`JSONP request to ${url} failed`));

      clearFunction(callbackName, callbackId);
      resetTimeout();
    });
  });
}
