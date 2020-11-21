import React from "react";
import { Book } from "@types";
import { createRenderer } from "react-test-renderer/shallow";
import { BookHeader } from "@components/BookHeader";

const renderer = createRenderer();
const useRouter = jest.spyOn(require("next/router"), "useRouter");

const dummyBook: Book = {
  chapters: [],
  coverDataUrl: "",
  price: 100,
  published: false,
  slug: "test-book-dummy",
  summary: "OK\nOK\nOK",
  title: "testbookdummy",
  topics: ["zenn"],
};
describe("<BookHeader/>", () => {
  it("should render and match the snapshot", () => {
    // mock useRouter()
    // See this link: https://github.com/vercel/next.js/issues/7479
    useRouter.mockImplementationOnce(() => ({
      query: {},
    }));
    renderer.render(<BookHeader book={dummyBook} />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
