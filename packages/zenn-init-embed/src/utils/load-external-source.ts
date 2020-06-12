type LoadScriptProps = {
  src: string;
  id?: string;
  refreshIfExist: boolean;
};

export function loadScript({
  src,
  id,
  refreshIfExist = true,
}: LoadScriptProps) {
  const identicalScript = id ? document.getElementById(id) : null;
  if (identicalScript) {
    if (!refreshIfExist) return; // refreshIfExist:falseの場合は何もせず終了
    identicalScript.remove(); // 既存の同一scriptは削除しておく
  }

  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.setAttribute("src", src);
    document.head.appendChild(script);
    script.onload = () => {
      if (id) script.setAttribute("id", id);
      resolve();
    };
    script.onerror = (e) => reject(e);
  });
}

type LoadStylesheetProps = {
  href: string;
  id: string;
};

export function loadStylesheet({ href, id }: LoadStylesheetProps) {
  if (document.getElementById(id)) return; // already loaded

  const link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("id", id);
  link.setAttribute("href", href);
  document.head.appendChild(link);
}
