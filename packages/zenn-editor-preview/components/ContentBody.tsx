import ContentWrapper from "@components/ContentWrapper";

const ContentBody: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ContentWrapper>
      <div className="znc" dangerouslySetInnerHTML={{ __html: content }} />
    </ContentWrapper>
  );
};
export default ContentBody;
