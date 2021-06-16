import React from 'react';
import { isLocationNotFoundError } from 'rocon/react';
import { ErrorMessage } from './ErrorMessage';

type ErrorType = null | 'NotFound' | 'Unknown';

type State = {
  error: ErrorType;
};

// @ts-ignore
const isProd = import.meta.env.PROD;

export class ErrorBoundary extends React.Component {
  state: State = {
    error: null,
  };

  componentDidCatch(error: unknown) {
    const errorType: ErrorType = isLocationNotFoundError(error)
      ? 'NotFound'
      : 'Unknown';

    this.setState({
      error: errorType,
    });
  }

  render() {
    if (this.state.error === null) {
      return this.props.children;
    }

    const unexpectedErrorMessaage = isProd
      ? '原因不明のエラーが発生しました'
      : 'エラーが発生。ブラウザのconsoleをチェックしてください';

    const message =
      this.state.error === 'NotFound'
        ? 'ページが見つかりませんでした'
        : unexpectedErrorMessaage;

    return <ErrorMessage message={message} />;
  }
}
