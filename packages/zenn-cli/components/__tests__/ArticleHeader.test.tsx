import React from "react";
import { ArticleHeader } from "@components/ArticleHeader";
import { Article } from "@types";
import { createRenderer } from "react-test-renderer/shallow";

const renderer = createRenderer();
const dummyArticle: Article = {
  content: "test",
  emoji: "h",
  published: false,
  slug: "dummy-article",
  tags: [],
  title: "test article",
  topics: ["Zenn"],
  type: "idea",
};
describe("<ArticleHeader />", () => {
  it("should render and match the snapshot", () => {
    renderer.render(<ArticleHeader article={dummyArticle} />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
