type LoadScriptParams = {
  src: string;
  id?: string;
  skipIfExist: boolean;
};

export const loadScript = ({
  src,
  id,
  skipIfExist = true,
}: LoadScriptParams) => {
  const identicalScript = id ? document.getElementById(id) : null;
  if (identicalScript && skipIfExist) return;

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
