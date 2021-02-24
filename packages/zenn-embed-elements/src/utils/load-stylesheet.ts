type LoadStylesheetProps = {
  href: string;
  id: string;
};

export function loadStylesheet({ href, id }: LoadStylesheetProps) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();

    const linkElem = document.createElement('link');
    linkElem.setAttribute('href', href);
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('id', id);
    document.head.appendChild(linkElem);
    linkElem.onload = () => {
      resolve();
    };
    linkElem.onerror = (e) => reject(e);
  });
}
