import React from 'react';
import styled from 'styled-components';

type Props =
  | {
      children: React.ReactNode;
    }
  | { rawHtml: string };

export const BodyContent: React.VFC<Props> = (props) => {
  if ('rawHtml' in props) {
    if (!props.rawHtml?.length) {
      return <StyledMessage>本文を入力してください</StyledMessage>;
    }
    return (
      <div
        className="znc"
        dangerouslySetInnerHTML={{
          __html: props.rawHtml,
        }}
      />
    );
  }
  return <div className="znc">{props.children}</div>;
};

const StyledMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: var(--c-gray);
`;
