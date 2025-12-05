import { Box, Tab, Tabs, Theme, Typography, useTheme } from '@mui/material';
import { GxLogo } from '../../shared/components/GxLogo';
import { NavigationProps, NavigationView } from './Navigation.types';
import { useTranslation } from 'react-i18next';
import { SocialIcons } from '../SocialIcons/SocialIcons';

export const NAVIGATION_HEIGHT = 70;

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const app_version = process.env.APP_VERSION;

  const handleTabChange = (_: React.SyntheticEvent, newValue: NavigationView) => {
    onViewChange(newValue);
  };

  return (
    <Box sx={sx.navigationContainer}>
      <Box sx={sx.leftSection}>
        <Box sx={sx.logoSection}>
          <GxLogo version="light" />
          <Box sx={sx.logoTextWrapper}>
            <Typography sx={sx.logoText}>{t('general.appTitle')}</Typography>
            <Typography sx={sx.versionText}>{app_version}</Typography>
          </Box>
        </Box>

        <Box sx={sx.tabsSection}>
          <Tabs
            value={currentView}
            onChange={handleTabChange}
            sx={sx.tabs}
            slotProps={{
              indicator: {
                sx: sx.tabIndicator
              }
            }}
          >
            <Tab
              label={t('navigation.viewer')}
              value="viewer"
              sx={sx.tab}
            />
            <Tab
              label={t('navigation.dashboard')}
              value="dashboard"
              sx={sx.tab}
            />
          </Tabs>
        </Box>
      </Box>
      <Box sx={sx.rightSection}>
        <SocialIcons />
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  navigationContainer: {
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: `${NAVIGATION_HEIGHT}px`,
    background: `linear-gradient(90deg, ${theme.palette.gx.darkGrey[100]} 0%, ${theme.palette.gx.darkGrey[300]} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: '24px',
    pointerEvents: 'none'
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '50px'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'auto'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    position: 'relative'
  },
  logoText: {
    color: theme.palette.gx.primary.white,
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '20px'
  },
  versionText: {
    fontSize: '12px',
    lineHeight: '12px',
    color: theme.palette.gx.lightGrey[500],
    alignSelf: 'flex-end'
  },
  tabsSection: {
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'auto'
  },
  tabs: {
    minHeight: '48px',
    '& .MuiTabs-flexContainer': {
      gap: '12px'
    },
    '& .MuiTabs-indicator': {
      display: 'none'
    }
  },
  tab: {
    color: theme.palette.gx.lightGrey[500],
    fontWeight: 600,
    fontSize: '15px',
    textTransform: 'capitalize',
    padding: '10px 24px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    borderRadius: '0 14px 0 14px',
    borderBottom: '2px solid transparent',
    '&.Mui-selected': {
      color: theme.palette.gx.primary.white,
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(15px)',
      borderBottom: `2px solid ${theme.palette.gx.accent.greenBlue}`,
      boxShadow: `0 0 12px ${theme.palette.gx.accent.greenBlue}50`
    },
    '&:hover:not(.Mui-selected)': {
      color: theme.palette.gx.lightGrey[300],
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)'
    }
  },
  tabIndicator: {
    display: 'none'
  }
});
