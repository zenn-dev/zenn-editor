import { Article } from "@types";
import { getArticleErrors } from "@utils/validator";
import ContentWrapper from "@components/ContentWrapper";
import ErrorRow from "@components/ErrorRow";

const ArticleHeader: React.FC<{ article: Article }> = ({ article }) => {
  const errorMessages = getArticleErrors(article);
  const errorCount = errorMessages?.length;
  return (
    <header className="content-header">
      <ContentWrapper>
        <h1 className="content-header__title">{article.title || "No Title"}</h1>

        <div className="content-header__row">
          <span className="content-header__row-title">emoji</span>

          {article.emoji ? (
            <span style={{ fontSize: "20px" }}>{article.emoji}</span>
          ) : (
            "指定が必要です"
          )}
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">slug</span>
          {article.slug}
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">topics</span>
          {article.topics
            ? article.topics.map((t) => (
                <span className="content-header__topic">{t}</span>
              ))
            : "指定が必要です"}
        </div>

        {article.public !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">public</span>
            {article.public?.toString()}
            {article.public === false ? "（非公開）" : ""}
          </div>
        )}

        <div className="content-header__row">
          <span className="content-header__row-title">type</span>
          {article.type || "指定が必要です"}
          {article.type === "tech" ? "（技術記事）" : ""}
          {article.type === "idea" ? "（アイデア）" : ""}
        </div>

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
          Articleのmdファイルの作成方法はこちら →
        </a>
      </ContentWrapper>
    </header>
  );
};
export default ArticleHeader;
