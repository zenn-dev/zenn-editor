type LoadStylesheetProps = {
  href: string;
  id: string;
};

export function loadStylesheet({ href, id }: LoadStylesheetProps) {
  const identicalLink = id ? document.getElementById(id) : null;
  return new Promise<void>((resolve, reject) => {
    if (identicalLink) {
      resolve();
    }
    const link = document.createElement('link');
    link.setAttribute('href', href);
    link.setAttribute('id', id);
    document.head.appendChild(link);
    link.onload = () => {
      resolve();
    };
    link.onerror = (e) => reject(e);
  });
}
