import { useState } from 'react';
import { Box, Button, Collapse, Typography, Theme, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GxInfoBoxProps } from './GxInfoBox.types';

export const GxInfoBox = ({
  title,
  tag,
  content,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  expandedWidth
}: GxInfoBoxProps) => {
  const [internalExpanded, setInternalExpanded] = useState<boolean>(defaultExpanded);

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const theme = useTheme();
  const sx = styles(theme);

  const handleToggleExpand = () => {
    const newExpanded = !expanded;
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onExpandedChange?.(newExpanded);
  };

  return (
    <Box
      sx={{
        ...sx.container,
        ...(expandedWidth
          ? {
              width: expanded ? '400px' : '200px',
              maxWidth: expanded ? 'none' : '400px'
            }
          : {
              width: 'auto',
              maxWidth: 'fit-content'
            })
      }}
    >
      <Button
        onClick={handleToggleExpand}
        sx={sx.headerButton}
        disableTouchRipple
      >
        <Box sx={sx.headerContent}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            {title}
          </Typography>
          {tag !== undefined && (
            <Typography
              variant="body2"
              sx={sx.tag}
            >
              {tag}
            </Typography>
          )}
        </Box>
        <ExpandMoreIcon
          className="expand-icon"
          sx={{
            ...sx.expandIcon,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: expanded ? 1 : sx.expandIcon.opacity,
            width: expanded ? '24px' : sx.expandIcon.width
          }}
        />
      </Button>
      <Collapse
        in={expanded}
        timeout="auto"
      >
        <Box sx={sx.contentContainer}>{content}</Box>
      </Collapse>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  // TODO: Review background contrast during design refactor
  container: {
    backgroundColor: theme.palette.gx.darkGrey[100],
    borderRadius: 2,
    overflow: 'visible',
    transition: 'all 300ms ease-in-out',
    '&:hover': {
      '& .expand-icon': {
        opacity: 1,
        width: '24px'
      }
    }
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    width: '100%',
    padding: '8px 10px',
    borderRadius: 0,
    color: theme.palette.gx.lightGrey[900],
    '&:hover': {
      backgroundColor: theme.palette.gx.darkGrey[300]
    }
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    whiteSpace: 'nowrap'
  },
  tag: {
    backgroundColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.primary.white,
    padding: '2px 6px',
    borderRadius: 1,
    fontSize: '12px',
    minWidth: '20px',
    textAlign: 'center'
  },
  expandIcon: {
    opacity: 0,
    transform: 'translateX(-10px)',
    transition: 'all 300ms ease-in-out',
    width: 0,
    overflow: 'hidden'
  },
  contentContainer: {
    padding: 2,
    borderTop: 1,
    borderColor: theme.palette.gx.darkGrey[900],
    color: theme.palette.gx.lightGrey[900]
  }
});
