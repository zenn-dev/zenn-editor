import React from 'react';

type Props = { children: React.ReactNode };
export const ContentWrapper: React.FC<Props> = ({ children }) => {
  return <div className="content-wrapper">{children}</div>;
};
