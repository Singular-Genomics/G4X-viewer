import { Box, Theme, useTheme } from '@mui/material';
import { useState } from 'react';
import { Navigation, NavigationView } from './Navigation';
import { ViewerView } from '../views/ViewerView';
import { DashboardView } from '../views/DashboardView';

export default function G4XViewer() {
  const theme = useTheme();
  const sx = styles(theme);

  const [currentView, setCurrentView] = useState<NavigationView>('viewer');

  const handleViewChange = (view: NavigationView) => {
    setCurrentView(view);
  };

  const getViewStyle = (viewName: NavigationView) => ({
    ...sx.viewContainer,
    opacity: currentView === viewName ? 1 : 0,
    visibility: currentView === viewName ? 'visible' : 'hidden',
    pointerEvents: currentView === viewName ? 'auto' : 'none',
    transition: 'opacity 0.25s ease-in-out'
  });

  return (
    <Box sx={sx.mainContainer}>
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <Box sx={sx.contentContainer}>
        <Box sx={getViewStyle('dashboard')}>
          <DashboardView />
        </Box>
        <Box sx={getViewStyle('viewer')}>
          <ViewerView />
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
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    willChange: 'opacity'
  }
});
