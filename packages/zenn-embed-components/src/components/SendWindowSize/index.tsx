import { useRef } from '@storybook/addons';
import { PropsWithChildren, useEffect } from 'react';

interface SendWindowSizeProps extends PropsWithChildren<{}> {
  url: string;
  className?: string;
}

/**
 * 他のwindowにウィンドウサイズをpostMessageする
 */
export const SendWindowSize = ({
  url,
  children,
  className,
}: SendWindowSizeProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!url) return;
    if (!ref.current) return;
    if (window.parent === window) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;

        const data = JSON.stringify({ url, width, height });

        // 親ウィンドウにデータを送る
        window.parent.postMessage(data, '*');
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [url]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
