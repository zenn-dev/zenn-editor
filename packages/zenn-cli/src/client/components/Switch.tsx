import styled from 'styled-components';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Switch: React.FC<Props> = (props) => {
  return (
    <StyledSwitch
      type="button"
      aria-checked={props.checked}
      onClick={() => {
        props.onChange?.(!props.checked);
      }}
    ></StyledSwitch>
  );
};

const StyledSwitch = styled.button`
  position: relative;
  display: inline-block;
  width: 46px;
  height: 27px;
  cursor: pointer;
  background-color: #acbcc7;
  border-radius: 99rem;
  padding: 3px;
  transition: 0.4s;

  &::after {
    position: relative;
    content: '';
    left: 1px;
    display: block;
    height: 100%;
    width: 21px;
    background-color: white;
    border-radius: 99rem;
  }

  &[aria-checked='true'] {
    background-color: var(--c-primary);
  }

  &[aria-checked='true']::after {
    left: calc(50% - 1px);
  }
`;
