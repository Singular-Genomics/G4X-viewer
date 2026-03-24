import { Box, Tab, Tabs, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GxLogo } from '../../shared/components/GxLogo';
import { NavigationProps, NavigationView } from './Navigation.types';
import { useTranslation } from 'react-i18next';
import { SocialIcons } from '../SocialIcons/SocialIcons';
import { NavigationRunInfo } from './NavigationRunInfo';

export const NAVIGATION_HEIGHT_MOBILE = 58;
export const NAVIGATION_HEIGHT_DESKTOP = 70;

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
          <GxLogo
            version="light"
            size={36}
          />
          <Box sx={sx.logoTextWrapper}>
            <Typography sx={sx.logoText}>{t('general.appTitle')}</Typography>
            <Typography sx={sx.versionText}>{app_version}</Typography>
          </Box>
        </Box>
        <NavigationRunInfo />
      </Box>
      <Box sx={sx.mobilePreviewBadge}>
        <Tooltip
          title={t('navigation.mobilePreviewTooltip')}
          placement="bottom-end"
          arrow
          enterTouchDelay={0}
          leaveTouchDelay={6000}
        >
          <Box
            component="span"
            sx={sx.mobilePreviewInner}
          >
            <Typography sx={sx.mobilePreviewText}>{t('navigation.mobilePreview')}</Typography>
          </Box>
        </Tooltip>
      </Box>
      <Box sx={sx.rightSection}>
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
    height: `${NAVIGATION_HEIGHT_MOBILE}px`,
    background: `linear-gradient(90deg, ${theme.palette.gx.darkGrey[100]} 0%, ${theme.palette.gx.darkGrey[300]} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingInline: '12px',
    pointerEvents: 'none',
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      height: `${NAVIGATION_HEIGHT_DESKTOP}px`,
      justifyContent: 'space-between',
      paddingInline: '24px'
    }
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    pointerEvents: 'auto',
    minWidth: 0,
    flex: 1,
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      gap: '20px'
    },
    [theme.breakpoints.up('lg')]: {
      gap: '30px'
    },
    [theme.breakpoints.up('xl')]: {
      gap: '50px'
    }
  },
  rightSection: {
    display: 'none',
    alignItems: 'center',
    gap: '40px',
    pointerEvents: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
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
    lineHeight: '20px',
    whiteSpace: 'nowrap'
  },
  versionText: {
    fontSize: '12px',
    lineHeight: '12px',
    color: theme.palette.gx.lightGrey[500],
    alignSelf: 'flex-end'
  },
  tabsSection: {
    display: 'none',
    alignItems: 'center',
    pointerEvents: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
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
  },
  mobilePreviewBadge: {
    display: 'flex',
    marginLeft: 'auto',
    pointerEvents: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  mobilePreviewInner: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 10px',
    background: alpha(theme.palette.gx.primary.white, 0.08),
    borderRadius: '4px',
    border: `1px solid ${alpha(theme.palette.gx.primary.white, 0.12)}`,
    cursor: 'pointer'
  },
  mobilePreviewText: {
    fontSize: '11px',
    fontWeight: 600,
    color: theme.palette.gx.lightGrey[500],
    lineHeight: 1
  }
});
