import ContentWrapper from "@components/ContentWrapper";

const ContentBody: React.FC<{
  content?: string;
  children?: React.ReactNode;
}> = ({ content, children }) => {
  return (
    <ContentWrapper>
      <div className="znc" style={{ margin: `40px 0` }}>
        {content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: content || "✍️本文を入力してください",
            }}
          />
        ) : (
          children
        )}
      </div>
    </ContentWrapper>
  );
};
export default ContentBody;
