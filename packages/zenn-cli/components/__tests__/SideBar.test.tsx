import React from "react";
import { createRenderer } from "react-test-renderer/shallow";
import { SideBar } from "@components/SideBar";
import { NavCollection, NavCollections } from "@types";

const renderer = createRenderer();
const dummyNavigation: NavCollection = {
  items: [{ name: "", href: "" }],
  name: "",
};
const dummyNavigations: NavCollections = [dummyNavigation];

describe("<SideBar />", () => {
  it("should render and match the snapshot", () => {
    renderer.render(<SideBar navCollections={dummyNavigations} />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
