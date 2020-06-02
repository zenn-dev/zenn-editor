type LoadScriptParams = {
  src: string;
  id?: string;
  refreshIfExist: boolean;
};

export const loadScript = ({
  src,
  id,
  refreshIfExist = true,
}: LoadScriptParams) => {
  const identicalScript = id ? document.getElementById(id) : null;
  if (identicalScript) {
    if (!refreshIfExist) return; // refreshIfExist:falseの場合は何もせず終了
    identicalScript.remove(); // 既存の同一scriptは削除しておく
  }

  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.setAttribute("src", src);
    document.body.appendChild(script);
    script.onload = () => {
      if (id) script.setAttribute("id", id);
      resolve();
    };
    script.onerror = (e) => reject(e);
  });
};
