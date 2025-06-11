import { SnackbarContent, useSnackbar } from 'notistack';
import { GxSnackbarProps } from './GxSnackbar.types';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { alpha, Box, Card, CardActions, Collapse, IconButton, Theme, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ReportRoundedIcon from '@mui/icons-material/ReportRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

export const GxSnackbar = forwardRef<HTMLDivElement, GxSnackbarProps>(
  ({ message, customContent, titleMode = 'brand', iconMode, id, customStyles }: GxSnackbarProps, ref) => {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const { closeSnackbar } = useSnackbar();
    const sx = styles(theme);

    const modalIcon = useMemo(() => {
      switch (iconMode ? iconMode : titleMode) {
        case 'success':
          return <CheckCircleIcon />;
        case 'error':
          return <ReportRoundedIcon />;
        case 'warning':
          return <WarningRoundedIcon />;
        case 'info':
        case 'brand':
          return <InfoIcon />;
      }
    }, [titleMode, iconMode]);

    const handleDismiss = useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    const handleExpandClick = useCallback(() => {
      setExpanded((oldExpanded) => !oldExpanded);
    }, []);

    return (
      <SnackbarContent ref={ref}>
        <Card sx={sx.snackbarBase}>
          <CardActions
            sx={{
              ...sx.snackbarTitle,
              ...customStyles?.titleStyles,
              ...sx.snackbarTitleMode[titleMode as keyof typeof sx.snackbarTitleMode]
            }}
          >
            {modalIcon}
            {message}
            <Box sx={sx.iconButtonsWrapper}>
              {customContent && (
                <IconButton
                  aria-label="Show more"
                  disableTouchRipple
                  sx={{
                    ...sx.iconButton,
                    ...(expanded && { transform: 'rotate(180deg)' })
                  }}
                  onClick={handleExpandClick}
                >
                  <ExpandMoreRoundedIcon />
                </IconButton>
              )}
              <IconButton
                onClick={handleDismiss}
                disableTouchRipple
                sx={sx.iconButton}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
          </CardActions>
          {customContent && (
            <Collapse
              in={expanded}
              timeout="auto"
            >
              <Box
                sx={{
                  ...sx.snackbarContentWrapper,
                  ...customStyles?.contentStyles
                }}
              >
                {customContent}
              </Box>
            </Collapse>
          )}
        </Card>
      </SnackbarContent>
    );
  }
);

const styles = (theme: Theme) => ({
  snackbarBase: {
    background: 'transparent',
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: '9999'
  },
  snackbarTitle: {
    padding: '8px 16px',
    minWidth: '300px',
    maxWidth: '600px',
    color: theme.palette.gx.primary.white,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent'
  },
  iconButtonsWrapper: {
    marginLeft: '8px'
  },
  iconButton: {
    color: theme.palette.gx.primary.white,
    transition: 'all .2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.2)
    }
  },
  snackbarTitleMode: {
    default: {
      background: theme.palette.gx.gradients.default()
    },
    brand: {
      background: theme.palette.gx.gradients.brand()
    },
    success: {
      background: theme.palette.gx.gradients.success()
    },
    error: {
      background: theme.palette.gx.gradients.danger()
    },
    warning: {
      background: theme.palette.gx.gradients.warning()
    },
    info: {
      background: theme.palette.gx.gradients.info()
    }
  },
  snackbarContentWrapper: {
    background: 'white',
    padding: '8px'
  }
});
