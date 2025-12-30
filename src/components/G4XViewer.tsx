import { Box, Theme, useTheme } from '@mui/material';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Navigation, NavigationView } from './Navigation';
import { GxLoader } from '../shared/components/GxLoader/GxLoader';
import { ViewerView } from '../views/ViewerView';

const DashboardView = lazy(() =>
  import('../views/DashboardView').then((module) => ({ default: module.DashboardView }))
);

export default function G4XViewer() {
  const theme = useTheme();
  const sx = styles(theme);

  const [currentView, setCurrentView] = useState<NavigationView>('viewer');
  const [dashboardScrollPosition, setDashboardScrollPosition] = useState(0);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleViewChange = (view: NavigationView) => {
    if (currentView === 'dashboard' && dashboardRef.current) {
      setDashboardScrollPosition(dashboardRef.current.scrollTop);
    }
    setCurrentView(view);
  };

  useEffect(() => {
    if (currentView === 'dashboard' && dashboardRef.current) {
      dashboardRef.current.scrollTop = dashboardScrollPosition;
    } else if (currentView === 'viewer' && viewerRef.current) {
      viewerRef.current.scrollTop = 0;
    }
  }, [currentView, dashboardScrollPosition]);

  const getViewStyle = (viewName: NavigationView) => ({
    ...sx.viewContainer,
    opacity: currentView === viewName ? 1 : 0,
    visibility: currentView === viewName ? 'visible' : 'hidden',
    pointerEvents: currentView === viewName ? 'auto' : 'none',
    transition: 'opacity 0.25s ease-in-out',
    overflow: viewName === 'dashboard' ? 'auto' : 'hidden'
  });

  return (
    <Box sx={sx.mainContainer}>
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <Box sx={sx.contentContainer}>
        <Box
          ref={dashboardRef}
          sx={getViewStyle('dashboard')}
        >
          <Suspense fallback={<GxLoader />}>
            <DashboardView />
          </Suspense>
        </Box>
        <Box
          ref={viewerRef}
          sx={getViewStyle('viewer')}
        >
          <ViewerView isViewerActive={currentView === 'viewer'} />
        </Box>
      </Box>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  mainContainer: {
    background: `linear-gradient(0deg, ${theme.palette.gx.darkGrey[500]}, ${theme.palette.gx.darkGrey[100]})`,
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden'
  },
  contentContainer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  viewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    willChange: 'opacity'
  }
});
