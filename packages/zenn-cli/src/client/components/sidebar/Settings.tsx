import React, { useState } from 'react';
import styled from 'styled-components';

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
};

export const Settings = <T extends LabelValue>(props: Props<T>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <StyledSettings className="settings">
      <button className="settings__open" onClick={() => setIsOpen(true)}>
        {props.openButtonIcon}
      </button>
      {isOpen && (
        <div className="settings__popover-container">
          <button
            className="settings__backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="settings__popover">
            {props.options.map(({ value, label }) => (
              <button
                key={`option-${value}`}
                value={value}
                onClick={() => props.setValue(value)}
                className={`settings__option ${
                  value === props.value ? 'settings__option--active' : ''
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </StyledSettings>
  );
};

const StyledSettings = styled.div`
  .settings__backdrop {
  }
`;
