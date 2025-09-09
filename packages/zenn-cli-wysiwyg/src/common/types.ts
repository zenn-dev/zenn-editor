import { Article } from 'zenn-model';
import { itemSortTypes } from './helper';

export type ItemSortType = (typeof itemSortTypes)[number];

export type WS_ClientMessage = WS_ArticlePostMessage;
export type WS_ServerMessage =
  | WS_LocalArticleChangedMessage
  | WS_ArticleSavedMessage;

export type WS_ServerMessageType = WS_ServerMessage['type'];

export type WS_LocalArticleChangedMessage = {
  type: 'localArticleFileChanged';
  data: { article: Article };
};

export type WS_ArticleSavedMessage = {
  type: 'articleSaved';
  data: { article: Article };
};

export type WS_ArticlePostMessage = {
  type: 'contentChanged';
  data: { article: Article };
};
