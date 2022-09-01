import React, { useState } from 'react';
import styled from 'styled-components';
import { MdCheck } from 'react-icons/md';

type LabelValue = string;

type Option<T extends LabelValue> = {
  label: string;
  value: T;
};

type Props<T extends LabelValue> = {
  options: Option<T>[];
  value: T;
  setValue: (value: T) => void;
  position: 'left' | 'center' | 'right';
  openButtonIcon: React.ReactNode;
  openButtonAriaLabel: string;
  width: number;
};

export const Settings = <T extends LabelValue>(props: Props<T>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function handleItemClick(value: T) {
    props.setValue(value);
    // improve ux
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }

  return (
    <StyledSettings className="settings">
      <button className="settings__open" onClick={() => setIsOpen(true)}>
        {props.openButtonIcon}
      </button>
      {isOpen && (
        <>
          <div
            className="settings__backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`settings__popover settings__popover--${props.position}`}
            style={{ width: props.width }}
          >
            {props.options.map(({ value, label }) => (
              <button
                key={`option-${value}`}
                value={value}
                onClick={() => handleItemClick(value)}
                className={`settings__option`}
                aria-selected={value === props.value}
              >
                <MdCheck className="settings__option-icon" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </StyledSettings>
  );
};

const StyledSettings = styled.div`
  display: flex;
  align-items: center;
  position: relative;

  .settings__open {
    display: inline-flex;
    align-items: center;
    color: var(--c-gray);
    &:hover {
      color: var(--c-body);
    }
  }
  .settings__backdrop {
    position: fixed;
    background: transparent;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .settings__backdrop,
  .settings__popover {
    z-index: 9999;
  }
  .settings__popover {
    position: absolute;
    background: #fff;
    top: calc(100% + 8px);
    box-shadow: 0 2px 8px rgb(15 26 62 / 35%);
    border-radius: 5px;
    font-size: 13.5px;
    overflow: hidden;
    padding: 5px;
  }
  .settings__popover--left {
    left: -10px;
  }
  .settings__popover--right {
    right: -10px;
  }
  .settings__popover--center {
    left: 50%;
    transform: translateX(-50%);
  }
  .settings__option {
    width: 100%;
    text-align: left;
    padding: 8px 8px 8px 22px;
    border-radius: 4px;
    &:hover {
      background: var(--c-gray-bg);
    }
    &[aria-selected='true'] {
      .settings__option-icon {
        opacity: 1;
      }
    }
  }
  .settings__option-icon {
    position: absolute;
    left: 8px;
    width: 16px;
    height: 16px;
    opacity: 0;
    color: var(--c-primary);
  }
`;
