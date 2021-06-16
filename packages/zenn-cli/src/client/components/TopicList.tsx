import React from 'react';
import styled from 'styled-components';

type Props = {
  topics: string[];
};

export const TopicList: React.VFC<Props> = ({ topics }) => {
  return (
    <StyledTopicList className="topic-list">
      {topics.map((t, i) => (
        <span className="topic-list__item" key={`topic-${i}`}>
          {t}
        </span>
      ))}
    </StyledTopicList>
  );
};

const itemMarginPx = '3px';

const StyledTopicList = styled.div`
  margin-top: -${itemMarginPx};
  .topic-list__item {
    display: inline-flex;
    color: var(--c-gray);
    font-size: 0.9em;
    border: solid 1px var(--c-gray-border);
    background: #fff;
    padding: 0.1em 0.4em;
    border-radius: 5px;
    margin: ${itemMarginPx} 6px ${itemMarginPx} 0;
  }
`;
