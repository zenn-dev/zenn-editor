import React, { useState } from 'react';
import { SideBar } from '@components/SideBar';
import { NavCollections } from '@types';

type Props = {
  navCollections: NavCollections;
};

export const MainContainer: React.FC<Props> = ({
  children,
  navCollections,
}) => {
  const [isSidebarMinimum, setIsSidebarMinimum] = useState(false);
  const handleSidebarWidth = () => {
    setIsSidebarMinimum(!isSidebarMinimum);
  };

  const sidebarClassNames = `main-sidebar${
    isSidebarMinimum ? ' main-sidebarMinimum' : ''
  }`;

  return (
    <div className="main-container">
      <div className={sidebarClassNames}>
        {isSidebarMinimum ? '' : <SideBar navCollections={navCollections} />}
        <button className="main-sidebar__minimize" onClick={handleSidebarWidth}>
          <img src="/chevron.svg" alt="" width={22} height={22} />
        </button>
      </div>
      <main className="main-content">{children}</main>
    </div>
  );
};
