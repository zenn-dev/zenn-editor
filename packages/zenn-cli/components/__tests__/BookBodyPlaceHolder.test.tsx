import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import { BookBodyPlaceholder } from '@components/BookBodyPlaceholder';

const renderer = createRenderer();
describe('<BookBodyPlaceHolder />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(<BookBodyPlaceholder />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
