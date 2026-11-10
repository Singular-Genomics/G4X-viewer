import { IconButton, SxProps, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GxModal } from '../../../../shared/components/GxModal';

export const CellMasksBoundaryToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [showBoundary, toggleBoundary] = useCellSegmentationLayerStore(
    useShallow((store) => [store.showBoundary, store.toggleBoundary])
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleBoundary = () => {
    const disableModal = localStorage.getItem('disableBoundaryWarning_DSA');
    if (disableModal || showBoundary) {
      toggleBoundary();
    } else {
      setIsModalOpen(true);
    }
  };

  const onContinue = () => {
    setIsModalOpen(false);
    toggleBoundary();
  };

  return (
    <>
      <Tooltip
        title={t(showBoundary ? 'segmentationSettings.boundaryHide' : 'segmentationSettings.boundaryShow')}
        arrow
      >
        <IconButton
          size="small"
          onClick={handleToggleBoundary}
          sx={sx.toggleButton}
        >
          {showBoundary ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <GxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={onContinue}
        title={t('general.warning')}
        colorVariant="danger"
        iconVariant="danger"
        dontShowFlag="disableBoundaryWarning_DSA"
      >
        <Typography sx={sx.modalContentText}>{t('segmentationSettings.boundaryPerformanceWarning')}</Typography>
        <Typography
          component={'span'}
          sx={sx.modalContentText}
        >
          <ul>
            <li>{t('segmentationSettings.boundaryPerformanceWarningCaseOne')}</li>
            <li>{t('segmentationSettings.boundaryPerformanceWarningCaseTwo')}</li>
          </ul>
        </Typography>
      </GxModal>
    </>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  toggleButton: {
    padding: '2px',
    alignSelf: 'flex-start',
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  },
  modalContentText: {
    fontWeight: 'bold'
  }
});
