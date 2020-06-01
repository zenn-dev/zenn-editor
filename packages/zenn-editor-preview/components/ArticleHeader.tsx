import { Article } from "@types";
import { getArticleErrors } from "@utils/validator";
import ContentWrapper from "@components/ContentWrapper";
import ErrorRow from "@components/ErrorRow";

const ArticleHeader: React.FC<{ article: Article }> = ({ article }) => {
  const errorMessages = getArticleErrors(article);
  return (
    <header className="content-header">
      <ContentWrapper>
        <h1 className="content-header__title">{article.title}</h1>

        <div className="content-header__row">
          <span className="content-header__row-title">emoji</span>
          {article.emoji}
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">slug</span>
          {article.slug}
        </div>

        <div className="content-header__row">
          <span className="content-header__row-title">topics</span>
          {article.topics?.map((t) => (
            <span className="content-header__topic">{t}</span>
          ))}
        </div>

        {article.public !== undefined && (
          <div className="content-header__row">
            <span className="content-header__row-title">public</span>
            {article.public?.toString()}
          </div>
        )}

        <div className="content-header__row">
          <span className="content-header__row-title">type</span>
          {article.type}
        </div>

        {errorMessages.map((errorMessage, index) => (
          <ErrorRow errorMessage={errorMessage} key={`invldmsg${index}`} />
        ))}
        <a href="todo" className="content-header__link" target="_blank">
          Articleのmdファイルの作成方法はこちら →
        </a>
      </ContentWrapper>
    </header>
  );
};
export default ArticleHeader;
