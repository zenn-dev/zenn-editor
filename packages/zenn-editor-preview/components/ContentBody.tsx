const ContentBody: React.FC<{ content: string }> = ({ content }) => {
  return <div className="znc" dangerouslySetInnerHTML={{ __html: content }} />;
};
export default ContentBody;
