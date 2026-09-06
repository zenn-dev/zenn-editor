import React from 'react';
import { TocNode } from 'zenn-model/lib/types';
import { BodyContent } from './BodyContent';
import { InsertAnchorButtonToHeadings } from './InsertAnchorButtonToHeadings';
import { Toc } from './Toc';

type Props = {
  bodyHtml?: string;
  toc?: TocNode[];
};

/**
 * 目次と本文をまとめて描画する。記事とチャプターで共通に使う。
 */
export const BodyContentWithToc: React.FC<Props> = ({ bodyHtml, toc }) => {
  return (
    <>
      {!!toc?.length && <Toc maxDepth={2} toc={toc} />}
      <InsertAnchorButtonToHeadings bodyHtml={bodyHtml}>
        <BodyContent rawHtml={bodyHtml || ''} />
      </InsertAnchorButtonToHeadings>
    </>
  );
};
