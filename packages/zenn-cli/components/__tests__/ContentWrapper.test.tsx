import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import { ContentWrapper } from '@components/ContentWrapper';

const renderer = createRenderer();

describe('<ContentWrapper/>', () => {
  it('should render and match the snapshot', () => {
    renderer.render(
      <ContentWrapper>
        <div />
      </ContentWrapper>
    );
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
