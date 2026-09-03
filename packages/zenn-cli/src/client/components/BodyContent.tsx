import { useMemo } from 'react';
import styled from 'styled-components';
import { PrintDetailsOpener } from './PrintDetailsOpener';

type Props =
  | {
      children: React.ReactNode;
    }
  | { rawHtml: string };

export const BodyContent: React.FC<Props> = (props) => {
  const rawHtml = 'rawHtml' in props ? props.rawHtml : undefined;
  // React 19 は dangerouslySetInnerHTML のオブジェクトが変わるたびに innerHTML を再代入するため、
  // rawHtml が変わらない限り同じオブジェクトを渡して本文の DOM を維持する
  const innerHTML = useMemo(
    () => (rawHtml === undefined ? undefined : { __html: rawHtml }),
    [rawHtml]
  );

  if ('rawHtml' in props) {
    if (!props.rawHtml?.length) {
      return <StyledMessage>本文を入力してください</StyledMessage>;
    }
    return (
      <PrintDetailsOpener bodyHtml={props.rawHtml}>
        <div className="znc" dangerouslySetInnerHTML={innerHTML} />
      </PrintDetailsOpener>
    );
  }
  return <div className="znc">{props.children}</div>;
};

const StyledMessage = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: var(--c-gray);
`;
