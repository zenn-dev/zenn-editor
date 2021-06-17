import React, { useEffect } from 'react';
import { RoconRoot, useLocation } from 'rocon/react';
import { ErrorBoundary } from './ErrorBoundary';
import { Layout } from './Layout';
import { Routes } from './Routes';
import { HotReloadRoot } from '../hooks/useLocalFileChangedEffect';
import '../global.css';
import 'zenn-content-css';

// Scroll to the top of the window on route changes.
const ScrollAdjuster: React.VFC = () => {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location]);
  return null;
};

export const App: React.VFC = () => {
  // init embed elements
  useEffect(() => {
    import('zenn-embed-elements');
  }, []);

  return (
    <ErrorBoundary>
      <HotReloadRoot>
        <RoconRoot>
          {/* must locate inside RoconRoot */}
          <ScrollAdjuster />
          <Layout>
            <Routes />
          </Layout>
        </RoconRoot>
      </HotReloadRoot>
    </ErrorBoundary>
  );
};
