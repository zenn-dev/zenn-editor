import { PropsWithChildren, useEffect, useRef } from 'react';
import { EmbedElementResizeEventData } from '../../events/resize';

interface SendWindowSizeProps extends PropsWithChildren<{}> {
  src: string | null | undefined;
  className?: string;
}

/**
 * 他のwindowにウィンドウサイズをpostMessageする
 */
export const SendWindowSize = ({
  src,
  children,
  className,
}: SendWindowSizeProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!src) return;
    if (!ref.current) return;
    if (window.parent === window) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const data: EmbedElementResizeEventData = {
          src,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };

        // 親ウィンドウにデータを送る
        window.parent.postMessage(JSON.stringify(data), '*');
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
