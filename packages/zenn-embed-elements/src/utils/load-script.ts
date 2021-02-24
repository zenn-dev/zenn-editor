type LoadScriptProps = {
  src: string;
  id?: string;
};

export function loadScript({ src, id }: LoadScriptProps) {
  const identicalScript = id ? document.getElementById(id) : null;
  return new Promise<void>((resolve, reject) => {
    if (identicalScript) {
      resolve();
    }
    const script = document.createElement('script');
    script.setAttribute('src', src);
    document.head.appendChild(script);
    script.onload = () => {
      if (id) script.setAttribute('id', id); // 読み込みが完了してからIDを付与する（でないと読み込みが完了していないのにidenticalScriptの条件分岐で終了してしまう）
      resolve();
    };
    script.onerror = (e) => reject(e);
  });
}
