import styled from 'styled-components';

type Props = {
  topics: string[];
};

export const TopicList: React.FC<Props> = ({ topics }) => {
  return (
    <StyledTopicList className="topic-list">
      {topics.map((t, i) =>
        typeof t === 'string' ? (
          <a
            href={`https://zenn.dev/topics/${t.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            key={`topic-${i}`}
          >
            <span className="topic-list__item topic-list__item--valid">
              {t}
            </span>
          </a>
        ) : (
          <span className="topic-list__item" key={`topic-${i}`}>
            {t}
          </span>
        )
      )}
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
  .topic-list__item--valid {
    &:hover {
      background: var(--c-primary-bg-lightest);
    }
  }
`;
