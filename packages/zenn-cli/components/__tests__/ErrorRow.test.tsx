import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import { ErrorRow } from '@components/ErrorRow';
import { ErrorMessage } from '@types';

const renderer = createRenderer();
const dummyError: ErrorMessage = {
  isCritical: false,
  message: 'dummy Error!',
};

describe('<ErrorRow />', () => {
  it('should render and match the snapshot', () => {
    renderer.render(<ErrorRow errorMessage={dummyError} />);
    const renderedOutput = renderer.getRenderOutput();
    expect(renderedOutput).toMatchSnapshot();
  });
});
