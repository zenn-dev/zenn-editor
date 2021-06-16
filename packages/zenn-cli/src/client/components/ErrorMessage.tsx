import React from 'react';
import styled from 'styled-components';

type Props = { message?: string };

export const ErrorMessage: React.VFC<Props> = (props) => {
  return (
    <StyledErrorMessage className="error-message">
      <div className="error-message__inner">
        <img
          src="https://twemoji.maxcdn.com/2/svg/1f63f.svg"
          alt=""
          width={90}
          height={90}
          className="error-message__icon"
        />
        <div className="error-message__text">
          {props.message || 'エラーが発生しました'}
        </div>
      </div>
    </StyledErrorMessage>
  );
};

const StyledErrorMessage = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .error-message__inner {
    transform: translateY(-25%);
    padding: 1rem;
  }
  .error-message__icon {
    display: block;
    margin: 0 auto;
  }
  .error-message__text {
    margin-top: 1.7rem;
    text-align: center;
    font-weight: 700;
    font-size: 1.4rem;
  }
`;
