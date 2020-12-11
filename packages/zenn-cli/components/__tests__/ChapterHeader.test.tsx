import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import { ChapterHeader } from '@components/ChapterHeader';
import { Chapter } from '@types';

const renderer = createRenderer();
const dummyChapter: Chapter = {
  content: 'test chapter',
  free: false,
  position: undefined,
  slug: 'test-chapter-dummy',
  title: 'dummy chapter',
};

describe('<ChapterHeader />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(<ChapterHeader chapter={dummyChapter} />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
