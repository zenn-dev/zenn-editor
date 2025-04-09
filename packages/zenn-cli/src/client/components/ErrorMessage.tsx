import styled from 'styled-components';

type Props = { message?: string };

export const ErrorMessage: React.FC<Props> = (props) => {
  return (
    <StyledErrorMessage className="error-message">
      <div className="error-message__inner">
        <svg stroke="currentColor"
          fill="currentColor"
          className="error-message__icon"
          stroke-width="0"
          viewBox="0 0 24 24"
          height={90}
          width={90}
          xmlns="http://www.w3.org/2000/svg">
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
        </svg>
      </div>
      <div className="error-message__text">
        {props.message || 'エラーが発生しました'}
      </div>
    </StyledErrorMessage>
  );
};

const StyledErrorMessage = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
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
