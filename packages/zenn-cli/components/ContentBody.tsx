import { ContentWrapper } from "@components/ContentWrapper";

type Props = {
  content?: string;
  children?: React.ReactNode;
};

export const ContentBody: React.FC<Props> = ({ content, children }) => {
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
