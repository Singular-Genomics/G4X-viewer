import { alpha, Box, LinearProgress, Theme, useTheme } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { GxDropzoneButton } from '../../../../shared/components/GxDropzoneButton';
import { useCellMasksFileHandler } from './helpers/useCellMasksFileHandler';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellMasksDropzoneButtonProps } from './CellMasksDropzoneButton.types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { humanFileSize } from '../../../../utils/utils';
import { SEGMENTATION_FILE_SIZE_LIMIT } from '../../../../shared/constants';

export const CellMasksDropzoneButton = ({ setLockSwitch }: CellMasksDropzoneButtonProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const source = useViewerStore((store) => store.source);
  const fileName = useCellSegmentationLayerStore((store) => store.fileName);
  const { dropzoneProps, loading, progress } = useCellMasksFileHandler();

  useEffect(() => setLockSwitch(loading), [setLockSwitch, loading]);

  return (
    <Box>
      <GxDropzoneButton
        labelTitle={t('sourceFiles.segmentationFileInputLabel')}
        labelText={fileName}
        buttonText={t('sourceFiles.segmentationFileUploadButton')}
        disabled={!source}
        helperText={t('sourceFiles.uploadedFileSizeHelper', { size: humanFileSize(SEGMENTATION_FILE_SIZE_LIMIT, 0) })}
        {...dropzoneProps}
      />
      {loading && (
        <LinearProgress
          sx={sx.progressBar}
          variant="determinate"
          value={progress}
        />
      )}
    </Box>
  );
};

const styles = (theme: Theme) => ({
  progressBar: {
    '& .MuiLinearProgress-barColorPrimary': {
      backgroundColor: `${theme.palette.gx.accent.greenBlue} !important`
    },
    '&.MuiLinearProgress-root': {
      backgroundColor: `${alpha(theme.palette.gx.accent.greenBlue, 0.2)} !important`
    }
  }
});
