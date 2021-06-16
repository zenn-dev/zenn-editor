import React from 'react';
import styled, { keyframes } from 'styled-components';

type Props = { margin?: string };

export const Loading: React.VFC<Props> = (props) => {
  return <StyledLoading style={{ margin: props.margin }} />;
};

const rotate = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const fadein = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const StyledLoading = styled.div`
  display: table;
  width: 30px;
  height: 30px;
  margin: 0 auto;
  border: 4px solid var(--c-primary);
  border-radius: 50%;
  border-top-color: var(--c-primary-bg);
  animation: ${rotate} 0.8s linear infinite, ${fadein} 0.7s;
`;
