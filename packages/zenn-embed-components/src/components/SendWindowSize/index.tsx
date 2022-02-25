import { useRef } from '@storybook/addons';
import { PropsWithChildren, useEffect } from 'react';

interface SendWindowSizeProps extends PropsWithChildren<{}> {
  className?: string;
}

/**
 * 他のwindowにウィンドウサイズをpostMessageする
 */
export const SendWindowSize = ({
  children,
  className,
}: SendWindowSizeProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!window.parent) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const url = window.origin;
        const { width, height } = entry.contentRect;

        const data = JSON.stringify({ url, width, height });

        // 親ウィンドウにデータを送る
        window.parent.postMessage(data, '*');
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
