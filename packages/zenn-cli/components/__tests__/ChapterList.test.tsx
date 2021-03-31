import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import { Chapter } from '@types';
import { ChapterList } from '@components/ChapterList';

const renderer = createRenderer();
const dummyChapter: Chapter = {
  content: 'test chapter',
  free: false,
  position: undefined,
  slug: 'test-chapter-dummy',
  title: 'dummy chapter',
};
const dummyBookSlug = 'dummy_book_slug_name';

describe('<ChapterList />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(
      <ChapterList chapters={[dummyChapter]} bookSlug={dummyBookSlug} />
    );
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
