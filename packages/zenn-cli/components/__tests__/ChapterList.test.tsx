import React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { Book, Chapter } from "@types";
import { ChapterList } from "@components/ChapterList";

const renderer = createRenderer();
const dummyChapter: Chapter = {
  content: "",
  free: false,
  position: undefined,
  slug: "",
  title: "",
};
const dummyBookSlug = "dummy_book_slug_name";

describe("<ChapterList />", () => {
  it("should render and match the snapshot", () => {
    renderer.render(
      <ChapterList chapters={[dummyChapter]} bookSlug={dummyBookSlug} />
    );
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
