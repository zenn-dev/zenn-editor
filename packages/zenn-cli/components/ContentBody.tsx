import React from 'react';
import { ContentWrapper } from '@components/ContentWrapper';

type Props = {
  content?: string;
  children?: React.ReactNode;
};

export const ContentBody: React.FC<Props> = ({ content, children }) => {
  return (
    <ContentWrapper>
      <div style={{ margin: `40px 0` }}>
        {content ? (
          <div
            className="znc"
            dangerouslySetInnerHTML={{
              __html: content || '✍ 本文を入力してください',
            }}
          />
        ) : (
          <div className="znc">{children}</div>
        )}
      </div>
    </ContentWrapper>
  );
};
