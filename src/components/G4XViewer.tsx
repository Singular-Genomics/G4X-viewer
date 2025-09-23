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
    display: currentView === viewName ? 'flex' : 'none'
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
    flexDirection: 'column'
  },
  viewContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'column'
  }
});
