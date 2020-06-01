import { ErrorMessage } from "@types";

const ErrorRow: React.FC<{ errorMessage: ErrorMessage }> = ({
  errorMessage,
}) => {
  const classNames = `error-row error-row--${errorMessage.errorType}`;
  return (
    <div
      className={classNames}
      dangerouslySetInnerHTML={{ __html: errorMessage.message }}
    />
  );
};

export default ErrorRow;
