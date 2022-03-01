import { PropsWithChildren, useEffect, useRef } from 'react';
import { EmbedElementResizeEventData } from '../../events/resize';

interface SendWindowSizeProps extends PropsWithChildren<{}> {
  id: number | null | undefined;
  className?: string;
}

/**
 * 他のwindowにウィンドウサイズをpostMessageする
 */
export const SendWindowSize = ({
  id,
  children,
  className,
}: SendWindowSizeProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof id !== 'number') return;
    if (window.parent === window) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const data: EmbedElementResizeEventData = {
          id,
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };

        // 親ウィンドウにデータを送る
        window.parent.postMessage(JSON.stringify(data), '*');
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [id]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
