type LoadScriptProps = {
  src: string;
  id?: string;
  funcToRefresh?: () => void;
};

export function loadScript({ src, id, funcToRefresh }: LoadScriptProps) {
  const identicalScript = id ? document.getElementById(id) : null;
  if (identicalScript) {
    if (funcToRefresh) funcToRefresh();
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.setAttribute('src', src);
    document.head.appendChild(script);
    script.onload = () => {
      if (id) script.setAttribute('id', id);
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

  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('id', id);
  link.setAttribute('href', href);
  document.head.appendChild(link);
}
