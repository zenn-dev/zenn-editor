import { NextPageContext } from "next";

const Error = ({ statusCode }: { statusCode: number }) => {
  return (
    <div className="error">
      <div className="error-container">
        <h1 className="error-title">😿エラーが発生しました</h1>
        <p className="error-message">
          コンソールのエラーメッセージをご確認ください
        </p>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
