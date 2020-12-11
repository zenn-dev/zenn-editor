import React from 'react';
import { ErrorMessage } from '@types';

type Props = { errorMessage: ErrorMessage };

export const ErrorRow: React.FC<Props> = ({ errorMessage }) => {
  let className = 'error-row';
  if (!errorMessage.isCritical) {
    className = className + ' ' + 'error-row--critical';
  }
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: errorMessage.message }}
    />
  );
};
