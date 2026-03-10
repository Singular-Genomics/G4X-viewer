import { Box, IconButton, Typography, Popover, Theme, useTheme, alpha } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { formatDetailsPopupData } from './DetailsPopup.helpers';
import { useViewerStore } from '../../stores/ViewerStore';

export const DetailsPopup = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const detailsData = useViewerStore((state) => state.generalDetails);

  useEffect(() => {
    const handleControllerToggle = () => {
      setIsVisible((prev) => !prev);
    };

    window.addEventListener('onControllerToggle', handleControllerToggle);
    return () => {
      window.removeEventListener('onControllerToggle', handleControllerToggle);
    };
  }, []);

  if (!detailsData || !isVisible) return null;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderDataSection = (sectionTitle: string, sectionData: Record<string, any>) => (
    <>
      <Typography
        variant="h6"
        sx={sx.sectionTitle}
      >
        {sectionTitle}
      </Typography>
      <Box sx={sx.dataSection}>
        {formatDetailsPopupData(sectionData).map((item, index) => (
          <Box
            key={index}
            sx={sx.dataRow}
          >
            <Typography sx={sx.label}>{item.label}:</Typography>
            <Typography sx={sx.value}>{item.value}</Typography>
          </Box>
        ))}
      </Box>
    </>
  );

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={sx.infoButton}
      >
        <InfoIcon />
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transitionDuration={250}
        sx={sx.popover}
      >
        <Box sx={sx.contentContainer}>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={sx.closeButton}
          >
            <CloseIcon />
          </IconButton>
          {Object.entries(detailsData.data).map(([sectionKey, sectionData]) => (
            <Box key={sectionKey}>
              {renderDataSection(sectionKey.split('_').join(' '), sectionData as Record<string, any>)}
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  infoButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    color: theme.palette.gx.mediumGrey[300],
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.mediumGrey[300], 0.1)
    }
  },
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    color: theme.palette.gx.darkGrey[300],
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[300], 0.1)
    }
  },
  popover: {
    '& .MuiPopover-paper': {
      backgroundColor: theme.palette.gx.lightGrey[100],
      border: `5px solid ${theme.palette.gx.mediumGrey[300]}`,
      borderRadius: '10px'
    }
  },
  contentContainer: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: '400px',
    position: 'relative'
  },
  sectionTitle: {
    color: theme.palette.gx.darkGrey[100],
    fontWeight: '700',
    marginBottom: '8px',
    fontSize: '1.1rem'
  },
  dataSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  label: {
    color: theme.palette.gx.darkGrey[100],
    fontWeight: '500',
    fontSize: '0.95rem'
  },
  value: {
    color: theme.palette.gx.darkGrey[100],
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '300px',
    wordWrap: 'break-word',
    fontSize: '0.95rem'
  }
});
