import React from 'react';
import styled from 'styled-components';
import { MdOutlineCallMade } from 'react-icons/md';

interface Props {
  title: string;
  emoji?: string;
  iconImgSrc?: string;
  label?: string;
  showNewTabIcon?: boolean;
}

export const ListItemInner: React.VFC<Props> = (props) => {
  return (
    <StyledListItemInner className="list-item-inner">
      {typeof props.emoji === 'string' && (
        <span className="list-item-inner__emoji">{props.emoji}</span>
      )}
      {typeof props.iconImgSrc === 'string' && (
        <img
          src={props.iconImgSrc}
          width={18}
          height={18}
          alt=""
          className="list-item-inner__icon"
        />
      )}
      {!!props.label && (
        <span className="list-item-inner__label">{props.label}</span>
      )}
      <div className="list-item-inner__title" title={props.title}>
        {props.title}
        {props.showNewTabIcon === true && (
          <MdOutlineCallMade className="list-item-inner__icon-open" />
        )}
      </div>
    </StyledListItemInner>
  );
};

const StyledListItemInner = styled.div`
  display: flex;
  align-items: center;

  .list-item-inner__emoji {
    margin-right: 7px;
  }
  .list-item-inner__icon {
    margin-right: 5px;
  }
  .list-item-inner__label {
    display: inline-block;
    padding: 1px 3px;
    margin-right: 4px;
    border: solid 1px var(--c-gray-border);
    color: var(--c-gray);
    font-size: 11px;
    border-radius: 4px;
    background: #fff;
    line-height: 1.3;
  }
  .list-item-inner__title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list-item-inner__icon-open {
    margin: 0 2px;
    width: 15px;
    height: 15px;
    vertical-align: -2px;
    opacity: 0.7;
  }
`;
