import ContentWrapper from "@components/ContentWrapper";

const ContentBody: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ContentWrapper>
      <div
        className="znc"
        style={{ margin: `40px 0` }}
        dangerouslySetInnerHTML={{
          __html: content || "✍️本文を入力してください",
        }}
      />
    </ContentWrapper>
  );
};
export default ContentBody;
