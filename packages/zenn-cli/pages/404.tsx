import { NextPage } from 'next';
import Link from 'next/link';

const NotFoundPage: NextPage = () => {
  return (
    <div className="error">
      <div className="error-container">
        <h1 className="error-title">😿 ページが見つかりませんでした</h1>
        <Link href="/" passHref>
          <a className="error-link">トップへ戻る</a>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
