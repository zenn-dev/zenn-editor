type LoadStylesheetProps = {
  href: string;
  id: string;
  /** Subresource Integrity のハッシュ（例: `sha384-...`） */
  integrity?: string;
  /** integrity を検証するためにクロスオリジンのリソースでは指定が必要 */
  crossOrigin?: 'anonymous' | 'use-credentials';
};

export function loadStylesheet({
  href,
  id,
  integrity,
  crossOrigin,
}: LoadStylesheetProps) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();

    const linkElem = document.createElement('link');
    if (integrity) linkElem.setAttribute('integrity', integrity);
    if (crossOrigin) linkElem.setAttribute('crossorigin', crossOrigin);
    linkElem.setAttribute('href', href);
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('id', id);
    linkElem.onload = () => {
      resolve();
    };
    linkElem.onerror = (e) => reject(e);
    document.head.appendChild(linkElem);
  });
}
