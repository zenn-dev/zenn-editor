import { Book } from "@types";
import { getBookErrors } from "@utils/validator";
import ContentWrapper from "@components/ContentWrapper";
import ErrorRow from "@components/ErrorRow";

const BookHeader: React.FC<{ book: Book }> = ({ book }) => {
  const errorMessages = getBookErrors(book);
  const errorCount = errorMessages?.length;
  return (
    <header className="content-header">
      <ContentWrapper>
        <h1 className="content-header__title">{book.title || "No Title"}</h1>

        <div className="content-header__row">
          <span className="content-header__row-title">slug</span>
          {book.slug}
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">summary</span>
          {book.summary || "指定が必要です"}
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">topics</span>
          {Array.isArray(book.topics)
            ? book.topics.map((t, i) => (
                <span className="content-header__topic" key={`bt${i}`}>
                  {t}
                </span>
              ))
            : "指定が必要です"}
        </div>

        {book.public !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">public</span>
            {book.public?.toString()}
            {book.public === false ? "（非公開）" : ""}
          </div>
        )}

        {book.price !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">price</span>
            {book.price?.toString()}
            {book.price === 0 ? "（無料公開）" : ""}
          </div>
        )}

        {!!errorCount && (
          <div>
            <div className="content-header__error-title">
              {errorCount}件のエラー
            </div>
            {errorMessages.map((errorMessage, index) => (
              <ErrorRow errorMessage={errorMessage} key={`invldmsg${index}`} />
            ))}
          </div>
        )}

        <a href="todo" className="content-header__link" target="_blank">
          Bookの作成方法はこちら →
        </a>
      </ContentWrapper>
    </header>
  );
};
export default BookHeader;
