import React from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';

type Props = {
  children: React.ReactNode;
};

export const Layout: React.VFC<Props> = ({ children }) => {
  return (
    <StyledLayout className="layout">
      <aside className="layout__sidebar">
        <Sidebar />
      </aside>
      <main className="layout__main">{children}</main>
    </StyledLayout>
  );
};

const StyledLayout = styled.div`
  display: flex;
  .layout__main {
    flex: 1;
  }
`;
