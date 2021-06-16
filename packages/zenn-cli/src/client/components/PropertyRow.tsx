import React from 'react';
import styled from 'styled-components';

type Props = {
  title: string;
  children: React.ReactNode;
};

export const PropertyRow: React.VFC<Props> = (props) => {
  return (
    <StyledPropertyRow className="property-row">
      <div className="property-row__title">{props.title}</div>
      <div className="property-row__content">{props.children}</div>
    </StyledPropertyRow>
  );
};

const StyledPropertyRow = styled.div`
  display: flex;
  font-size: 0.92rem;
  color: var(--c-gray);
  & + .property-row {
    margin-top: 0.5rem;
  }
  .property-row__title {
    font-weight: 700;
    width: 140px;
  }
  .property-row__content {
    flex: 1;
  }
`;
