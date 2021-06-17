import React, { useEffect, useState, createContext, useContext } from 'react';

type ReloadedAt = number;

const HotReloadContext = createContext<{ reloadedAt: ReloadedAt }>({
  reloadedAt: 0,
});

export const HotReloadRoot: React.VFC<{ children: React.ReactNode }> = (
  props
) => {
  const [reloadedAt, setReloadedAt] = useState<ReloadedAt>(0);

  // websocket
  useEffect(() => {
    // e.g ws://localhost:8000
    const websocket = new WebSocket(`ws://${window.location.host}`);

    // detect local file changes
    websocket.onmessage = () => {
      setReloadedAt(new Date().getTime());
    };

    return () => {
      console.log('Disconnecting socket...');
      websocket.close();
    };
  }, []);

  return (
    <HotReloadContext.Provider value={{ reloadedAt }}>
      {props.children}
    </HotReloadContext.Provider>
  );
};

export function useLocalFileChangedEffect(fn: () => unknown) {
  const { reloadedAt } = useContext(HotReloadContext);

  useEffect(() => {
    if (reloadedAt !== 0) fn();
  }, [reloadedAt]);
}
