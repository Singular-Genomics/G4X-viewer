import { Box, IconButton, Typography, Theme, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { GxGridItemProps } from './GxGridItem.types';

export const GxGridItem = ({ children, className, title, onRemove, backgroundColor }: GxGridItemProps) => {
  const theme = useTheme();
  const sx = styles(theme, backgroundColor);

  return (
    <Box
      className={className}
      sx={sx.container}
    >
      <Box
        sx={sx.dragHandle}
        className="drag-handle"
      >
        <Box sx={sx.dragIndicator}>
          <DragIndicatorIcon sx={sx.dragIcon} />
        </Box>
        {title && (
          <Typography
            variant="subtitle2"
            sx={sx.title}
          >
            {title}
          </Typography>
        )}
      </Box>

      {onRemove && (
        <IconButton
          onClick={onRemove}
          sx={sx.removeButton}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Box sx={sx.content}>{children}</Box>
    </Box>
  );
};

const styles = (theme: Theme, backgroundColor?: string) => ({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: backgroundColor || theme.palette.gx.darkGrey[100],
    borderRadius: 2,
    border: `1px solid ${theme.palette.gx.darkGrey[500]}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 200ms ease-in-out'
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    padding: '6px 12px',
    background: `linear-gradient(90deg, ${theme.palette.gx.darkGrey[700]}, ${theme.palette.gx.darkGrey[300]})`,
    borderBottom: `1px solid ${theme.palette.gx.darkGrey[300]}`,
    minHeight: 32,
    cursor: 'grab'
  },
  dragIndicator: {
    display: 'flex',
    alignItems: 'center'
  },
  dragIcon: {
    fontSize: '16px',
    color: theme.palette.gx.lightGrey[700],
    opacity: 0.7
  },
  title: {
    color: theme.palette.gx.lightGrey[900],
    fontWeight: 600,
    fontSize: '0.875rem'
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    color: theme.palette.gx.lightGrey[700],
    padding: '4px',
    zIndex: 10,
    backgroundColor: 'transparent',
    transition: 'color 150ms ease-in-out',
    '&:hover': {
      color: theme.palette.gx.accent.error,
      backgroundColor: 'transparent'
    }
  },
  content: {
    flex: 1,
    padding: '12px',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }
});
