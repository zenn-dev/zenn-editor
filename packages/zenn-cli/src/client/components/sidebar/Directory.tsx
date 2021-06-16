import React from 'react';
import styled from 'styled-components';
import { usePersistedState } from '../../hooks/usePersistedState';
import { ListItemInner } from './ListItemInner';

export const Directory: React.VFC<{
  title: string;
  uniqueKey: string;
  defaultOpen: boolean;
  label?: string;
  children: React.ReactNode;
}> = (props) => {
  const id = `toggle-${props.uniqueKey}`;
  const storageKey = `toggle-${props.uniqueKey}-open`;
  // restore initial state using localStorage
  const [isOpen, setIsOpen] = usePersistedState<boolean>({
    cacheKey: storageKey,
    defaultValue: props.defaultOpen,
  });

  return (
    <StyledDirectory className="directory">
      <button
        className="directory__button"
        type="button"
        role="tab"
        aria-controls={id}
        aria-expanded={isOpen}
        aria-label="フォルダーを開く"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src="/icons/sidebar-item-arrow.svg"
          alt=""
          width={12}
          height={12}
          className={`directory__icon-arrow ${isOpen ? 'rotated' : ''}`}
        />
        <ListItemInner
          title={props.title}
          label={props.label}
          iconImgSrc={`/icons/${
            isOpen ? 'folder-open.svg' : 'folder-close.svg'
          }`}
        />
      </button>
      <div
        className="directory__children"
        role="tabpanel"
        aria-hidden={!isOpen}
        id={id}
      >
        {isOpen ? props.children : null}
      </div>
    </StyledDirectory>
  );
};

const StyledDirectory = styled.div`
  .directory__button {
    position: relative;
    padding: 5px 0 5px 15px;
    display: block;
    width: 100%;
    color: var(--c-gray);
    text-align: left;
    &:hover {
      color: var(--c-body);
    }
  }
  .directory__icon-arrow {
    position: absolute;
    top: 7px;
    left: -2px;
    &.rotated {
      top: 10px;
      transform: rotate(90deg);
    }
  }

  .directory__children {
    padding-left: 15px;
  }
`;
