import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { GxCollapsibleSectionProps } from './GxCollapsibleSection.types';
import { Box, Button, Collapse, IconButton, SxProps, Theme, Typography, lighten } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const GxCollapsibleSection = ({
  sectionTitle,
  sectionIcon,
  children,
  defultState = 'collapsed',
  unmountOnExit = true,
  customStyles,
  disabled,
  headerAction
}: React.PropsWithChildren<GxCollapsibleSectionProps>) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const [expanded, setExpanded] = useState<boolean>(defultState === 'open');

  useEffect(() => {
    if (disabled && expanded) {
      setExpanded(false);
    }
  }, [disabled, expanded]);

  const handleIconClick = useCallback(() => {
    setExpanded((previousState) => !previousState);
  }, []);

  const handleExpandScroll = useCallback(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, []);

  return (
    <Box
      sx={
        {
          ...customStyles?.sectionContainer
        } as SxProps
      }
    >
      <Box
        sx={
          {
            ...sx.sectionHeader,
            ...customStyles?.headerContainer
          } as SxProps
        }
        aria-disabled={disabled || undefined}
      >
        <Button
          sx={sx.sectionExpandButton}
          disabled={disabled}
          onClick={handleIconClick}
          aria-expanded={expanded}
          aria-controls={contentId}
        >
          {sectionIcon && (
            <Box
              component="span"
              aria-hidden="true"
              sx={sx.sectionIcon}
            >
              {sectionIcon}
            </Box>
          )}
          <Typography sx={{ ...sx.sectionTitle, ...customStyles?.titleText } as any}>{sectionTitle}</Typography>
          {!headerAction && (
            <ExpandMoreIcon
              style={{
                transform: `rotate(${expanded ? '180deg' : '0deg'})`,
                transition: 'transform 300ms ease-in-out'
              }}
              sx={sx.collapseIcon}
              fontSize="medium"
            />
          )}
        </Button>
        {headerAction && (
          <>
            <Box sx={sx.headerAction}>{headerAction}</Box>
            <IconButton
              disabled={disabled}
              onClick={handleIconClick}
              aria-label={sectionTitle}
              aria-expanded={expanded}
              aria-controls={contentId}
              sx={sx.expandIconButton}
            >
              <ExpandMoreIcon
                style={{
                  transform: `rotate(${expanded ? '180deg' : '0deg'})`,
                  transition: 'transform 300ms ease-in-out'
                }}
                fontSize="medium"
              />
            </IconButton>
          </>
        )}
      </Box>
      <Collapse
        onEntered={handleExpandScroll}
        in={expanded}
        ref={sectionRef}
        timeout="auto"
        unmountOnExit={unmountOnExit}
      >
        <Box
          id={contentId}
          sx={
            {
              ...sx.sectionContentContainer,
              ...customStyles?.contentContainer
            } as SxProps
          }
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

const sx = {
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: '0 8px',
    color: (theme: Theme) => theme.palette.text.primary,
    backgroundColor: (theme: Theme) => theme.palette.background.paper,
    width: '100%',
    borderRadius: '6px',
    overflow: 'hidden',
    transition: (theme: Theme) =>
      theme.transitions.create(['background-color', 'box-shadow', 'border-color', 'color'], {
        duration: 150
      }),
    '&:hover': {
      backgroundColor: (theme: Theme) => lighten(theme.palette.background.paper, 0.08)
    },
    '&[aria-disabled="true"]': {
      color: (theme: Theme) => theme.palette.action.disabled,
      pointerEvents: 'none'
    },
    '&:after': {
      background: (theme: Theme) => theme.palette.divider,
      bottom: 0,
      content: '""',
      display: 'block',
      height: '1px',
      left: 0,
      position: 'absolute',
      transition: 'transform 150ms ease',
      width: '100%',
      transform: 'translateX(-100%)'
    },
    '&:hover:after': {
      transform: 'translateX(0)'
    }
  },
  sectionExpandButton: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
    padding: '8px 0',
    color: 'inherit',
    borderRadius: 0,
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  sectionIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: '8px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: (theme: Theme) => theme.palette.text.primary,
    textWrap: 'nowrap',
    '.Mui-disabled &': {
      color: 'inherit'
    }
  },
  headerAction: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    paddingLeft: '12px',
    paddingRight: '8px'
  },
  expandIconButton: {
    padding: 0,
    color: (theme: Theme) => theme.palette.text.disabled,
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  collapseIcon: {
    marginLeft: 'auto',
    color: (theme: Theme) => theme.palette.text.disabled,
    '.Mui-disabled &': {
      color: 'inherit'
    }
  },
  sectionContentContainer: {
    position: 'relative',
    backgroundColor: (theme: Theme) => theme.palette.background.settingsPanel,
    padding: '8px 0px 19px',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '5%',
      width: '90%',
      height: '3px',
      backgroundColor: (theme: Theme) => theme.palette.sectionDivider
    }
  }
};
