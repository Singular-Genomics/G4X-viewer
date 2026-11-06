import { getSourceDataActionStyles } from '../../shared/components/sourceDataAction.styles';
import { Box, Button, IconButton, SvgIcon, Typography, Popover, Theme, useTheme, alpha, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { formatDetailsPopupData } from './DetailsPopup.helpers';
import { useViewerStore } from '../../stores/ViewerStore';
import { useTranslation } from 'react-i18next';

export const DetailsPopup = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const detailsData = useViewerStore((state) => state.generalDetails);

  if (!detailsData) return null;

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
        {formatDetailsPopupData({ section: sectionData, smpInfoOrder: detailsData.smpInfoOrder }).map((item, index) => (
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
      <Tooltip
        title={t('general.runMetadataTooltip')}
        arrow
      >
        <Button
          onClick={handleClick}
          size="small"
          fullWidth
          startIcon={
            <SvgIcon
              fontSize="small"
              viewBox="0 -960 960 960"
            >
              <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
            </SvgIcon>
          }
          sx={sx.infoButton}
        >
          {t('general.metadata')}
        </Button>
      </Tooltip>
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
  infoButton: getSourceDataActionStyles(theme),
  closeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.1)
    }
  },
  popover: {
    '& .MuiPopover-paper': {
      backgroundColor: theme.palette.background.default,
      border: `5px solid ${theme.palette.divider}`,
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
    color: theme.palette.text.primary,
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
    color: theme.palette.text.primary,
    fontWeight: '500',
    fontSize: '0.95rem'
  },
  value: {
    color: theme.palette.text.primary,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '300px',
    wordWrap: 'break-word',
    fontSize: '0.95rem'
  }
});
