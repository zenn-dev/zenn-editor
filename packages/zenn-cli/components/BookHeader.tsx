import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Book, ErrorMessage } from "@types";
import { getBookErrors } from "@utils/validator";
import { ContentWrapper } from "@components/ContentWrapper";
import { ErrorRow } from "@components/ErrorRow";

type Props = { book: Book };

export const BookHeader: React.FC<Props> = ({ book }) => {
  const [isCoverRatioError, setIsCoverRatioError] = useState<boolean>(false);
  const isCover = !!book.coverDataUrl;
  const baseErrorMessages = getBookErrors(book);
  const coverRatioError: ErrorMessage = {
    isCritical: true,
    message:
      "カバー画像の「幅 : 高さ」の比率は「1 : 1.4」にしてください（最終的に幅500px・高さ700pxにリサイズされます）",
  };

  const errorMessages = isCoverRatioError
    ? [coverRatioError, ...baseErrorMessages]
    : baseErrorMessages;
  const errorCount = errorMessages?.length;

  const { asPath } = useRouter();
  const imageRef = useRef(null);
  useEffect(() => {
    if (isCover) validateImageSize(imageRef.current);
  }, [asPath]);

  const validateImageSize = (imageEl: HTMLImageElement): void => {
    const idealApectRatio = 1.4;
    const width = imageEl.naturalWidth;
    const height = imageEl.naturalHeight;
    const aspectRatio = height / width;
    setIsCoverRatioError(Math.abs(aspectRatio - idealApectRatio) > 0.1);
  };

  return (
    <header className="content-header">
      <ContentWrapper>
        {isCover && (
          <div className="content-header__cover">
            <img src={book.coverDataUrl} ref={imageRef} />
          </div>
        )}

        <h1 className="content-header__title">{book.title || "No Title"}</h1>

        <div className="content-header__row">
          <span className="content-header__row-title">slug</span>
          <span className="content-header__row-result"> {book.slug}</span>
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">summary</span>
          <span
            className="content-header__row-result"
            style={{ whiteSpace: "pre-line" }}
          >
            {book.summary || "指定が必要です"}
          </span>
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">topics</span>
          <span className="content-header__row-result">
            {Array.isArray(book.topics) && book.topics.length
              ? book.topics.map((t, i) => (
                  <span className="content-header__topic" key={`bt${i}`}>
                    {t}
                  </span>
                ))
              : "指定が必要です"}
          </span>
        </div>

        {book.published !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">published</span>
            <span className="content-header__row-result">
              {book.published ? "✅（公開）" : "false（下書き）"}
            </span>
          </div>
        )}

        {book.price !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">price</span>
            <span className="content-header__row-result">
              {book.price?.toString()}
              {book.price === 0 ? "（無料公開）" : ""}
            </span>
          </div>
        )}

        {!!errorCount && (
          <div>
            <div className="content-header__error-title">
              {errorCount}件の修正が必要です
            </div>
            {errorMessages.map((errorMessage, index) => (
              <ErrorRow errorMessage={errorMessage} key={`invldmsg${index}`} />
            ))}
          </div>
        )}

        <a
          href="https://zenn.dev/zenn/articles/edit-book-using-cli"
          className="content-header__link"
          rel="noopener noreferrer"
          target="_blank"
        >
          Bookの作成方法はこちら →
        </a>
      </ContentWrapper>
    </header>
  );
};
