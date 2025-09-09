import { WS_ServerMessage, WS_ServerMessageType } from 'common/types';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { Article } from 'zenn-model';

type ReloadedAt = number;
type ArticleEvent = {
  type: WS_ServerMessageType;
  article: Article;
};

const HotReloadContext = createContext<{
  reloadedAt: ReloadedAt;
  ws: WebSocket | null;
  articleEvent: ArticleEvent | null;
}>({
  reloadedAt: 0,
  ws: null,
  articleEvent: null,
});

export const HotReloadRoot: React.VFC<{ children: React.ReactNode }> = (
  props
) => {
  const [reloadedAt, setReloadedAt] = useState<ReloadedAt>(0);
  const [articleEvent, setArticleEvent] = useState<ArticleEvent | null>(null);
  const [ws, setWS] = useState<WebSocket | null>(null);

  // websocket
  useEffect(() => {
    // e.g ws://localhost:8000
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocket = new WebSocket(`${protocol}//${window.location.host}`);

    // detect local file changes
    websocket.onmessage = (ev) => {
      setReloadedAt(new Date().getTime());

      const res: WS_ServerMessage = JSON.parse(ev.data);
      if (
        res.type === 'localArticleFileChanged' ||
        res.type === 'articleSaved'
      ) {
        setArticleEvent({
          type: res.type,
          article: res.data.article,
        });
      }
    };

    setWS(websocket);

    return () => {
      console.log('Disconnecting socket...');
      setWS(null);
      websocket.close();
    };
  }, []);

  return (
    <HotReloadContext.Provider value={{ reloadedAt, articleEvent, ws }}>
      {props.children}
    </HotReloadContext.Provider>
  );
};

export function useArticleChangedEffect(
  fn: (articleEvent: ArticleEvent) => unknown
) {
  const { articleEvent } = useContext(HotReloadContext);

  useEffect(() => {
    if (articleEvent !== null) fn(articleEvent);
  }, [articleEvent]);
}

export function useLocalFileChangedEffect(fn: () => unknown) {
  const { reloadedAt } = useContext(HotReloadContext);

  useEffect(() => {
    if (reloadedAt !== 0) fn();
  }, [reloadedAt]);
}

export function useWebSocket(): WebSocket | null {
  const { ws } = useContext(HotReloadContext);
  return ws;
}
