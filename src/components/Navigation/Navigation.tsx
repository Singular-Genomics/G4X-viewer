import { Box, IconButton, Tab, Tabs, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GxLogo } from '../../shared/components/GxLogo';
import { GxThemeModeToggle } from '../../shared/components/GxThemeModeToggle';
import { NavigationProps, NavigationView } from './Navigation.types';
import { useTranslation } from 'react-i18next';
import { SocialIcons } from '../SocialIcons/SocialIcons';
import { NavigationRunInfo } from './NavigationRunInfo';
import { ChangelogModal } from '../ChangelogModal';
import { useChangelog } from '../../hooks/useChangelog.hook';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export const NAVIGATION_HEIGHT_MOBILE = 58;
export const NAVIGATION_HEIGHT_DESKTOP = 70;

export const Navigation = ({ currentView, isViewerUiHidden, onViewChange, onToggleViewerUi }: NavigationProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const app_version = process.env.APP_VERSION;
  const { isOpen, currentEntries, showMore, openChangelog, closeChangelog } = useChangelog();

  const handleTabChange = (_: React.SyntheticEvent, newValue: NavigationView) => {
    onViewChange(newValue);
  };

  return (
    <Box sx={sx.navigationContainer}>
      <Box sx={sx.leftSection}>
        <Box sx={sx.logoSection}>
          <GxLogo
            size={36}
            color={theme.palette.navBar.text}
          />
          <Box sx={sx.logoTextWrapper}>
            <Typography sx={sx.logoText}>{t('general.appTitle')}</Typography>
            <Typography
              component="button"
              onClick={openChangelog}
              aria-label={t('changelog.showChangelogAria')}
              sx={sx.versionText}
            >
              {app_version}
            </Typography>
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
        <Box sx={sx.actionsSection}>
          <GxThemeModeToggle />
          <Tooltip
            title={
              currentView === 'viewer'
                ? t(isViewerUiHidden ? 'navigation.showViewerUi' : 'navigation.hideViewerUi')
                : ''
            }
          >
            <IconButton
              onClick={currentView === 'viewer' ? onToggleViewerUi : undefined}
              sx={{
                ...sx.viewerUiButton,
                ...(currentView === 'dashboard' ? sx.viewerUiButtonPlaceholder : {})
              }}
            >
              {isViewerUiHidden ? (
                <VisibilityOutlinedIcon fontSize="small" />
              ) : (
                <VisibilityOffOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <SocialIcons />
        </Box>
      </Box>
      <ChangelogModal
        isOpen={isOpen}
        onClose={closeChangelog}
        entries={currentEntries}
        showMore={!!showMore}
      />
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
    background: theme.palette.navBar.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: `${(NAVIGATION_HEIGHT_MOBILE - 36) / 2}px`,
    paddingRight: '12px',
    pointerEvents: 'none',
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      height: `${NAVIGATION_HEIGHT_DESKTOP}px`,
      justifyContent: 'space-between',
      paddingLeft: `${(NAVIGATION_HEIGHT_DESKTOP - 36) / 2}px`,
      paddingRight: '24px'
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
    paddingRight: '8px',
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
    color: theme.palette.navBar.text,
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '20px',
    whiteSpace: 'nowrap'
  },
  versionText: {
    opacity: 0.5,
    fontSize: '12px',
    lineHeight: '12px',
    color: theme.palette.navBar.text,
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'text-decoration-color 0.2s ease',
    '&:hover': {
      textDecorationColor: theme.palette.navBar.text
    }
  },
  tabsSection: {
    display: 'none',
    alignItems: 'center',
    pointerEvents: 'auto',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  viewerUiButton: {
    padding: '8px',
    color: theme.palette.navBar.text,
    '&:hover': {
      color: theme.palette.navBar.text,
      backgroundColor: alpha(theme.palette.navBar.text, 0.1)
    }
  },
  viewerUiButtonPlaceholder: {
    visibility: 'hidden',
    pointerEvents: 'none'
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
    color: theme.palette.navBar.text,
    fontWeight: 600,
    fontSize: '15px',
    textTransform: 'capitalize',
    padding: '10px 24px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    borderRadius: '6px',
    borderBottom: '2px solid transparent',
    '&.Mui-selected': {
      color: theme.palette.navBar.text,
      background: theme.palette.navBar.selectedBackground,
      backdropFilter: 'blur(15px)',
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
      boxShadow: `0 0 12px ${theme.palette.secondary.main}50`
    },
    '&:hover:not(.Mui-selected)': {
      color: theme.palette.navBar.text,
      background: theme.palette.navBar.hoverBackground,
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
    background: theme.palette.navBar.hoverBackground,
    borderRadius: '4px',
    border: `1px solid ${theme.palette.navBar.text}`,
    cursor: 'pointer'
  },
  mobilePreviewText: {
    fontSize: '11px',
    fontWeight: 600,
    color: theme.palette.navBar.text,
    lineHeight: 1
  }
});
