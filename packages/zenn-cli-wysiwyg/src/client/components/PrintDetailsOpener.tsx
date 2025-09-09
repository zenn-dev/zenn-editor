import React, { PropsWithChildren, useEffect, useRef } from 'react';

interface PrintDetailsOpenerProps {
  bodyHtml?: string | null;
}

/**
 * 印刷時に children 内の <detilas /> を開くようにするためのコンポーネント
 */
export const PrintDetailsOpener = ({
  bodyHtml,
  children,
}: PropsWithChildren<PrintDetailsOpenerProps>) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // 印刷時にdetailsを開くためのHooks
  useEffect(() => {
    if (!ref.current) return;
    if (!bodyHtml?.length) return;

    const details = Array.from(ref.current.getElementsByTagName('details'));

    const changeDetailStatusFactory = (open: boolean) => () => {
      details.forEach((detail) => {
        detail.open = open;
      });
    };

    const onBeforePrint = changeDetailStatusFactory(true);
    const onAfterPrint = changeDetailStatusFactory(false);

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [bodyHtml]);

  return (
    <div ref={ref} className="___print-details-opener">
      {children}
    </div>
  );
};
