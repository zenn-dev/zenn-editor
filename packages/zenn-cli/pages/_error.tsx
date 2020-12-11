import { NextPage } from 'next';
import Head from 'next/head';

type Props = { statusCode: number };

const Error: NextPage<Props> = ({ statusCode }) => {
  return (
    <>
      <Head>
        <title>{statusCode}エラー</title>
      </Head>
      <div className="error">
        <div className="error-container">
          <h1 className="error-title">😿エラーが発生しました</h1>
          <p className="error-message">
            コンソールのエラーメッセージをご確認ください
          </p>
        </div>
      </div>
    </>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
