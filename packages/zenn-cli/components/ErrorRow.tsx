import { ErrorMessage } from "@types";

const ErrorRow: React.FC<{ errorMessage: ErrorMessage }> = ({
  errorMessage,
}) => {
  let className = "error-row";
  if (!errorMessage.isCritical) {
    className = className + " " + "error-row--critical";
  }
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: errorMessage.message }}
    />
  );
};

export default ErrorRow;
