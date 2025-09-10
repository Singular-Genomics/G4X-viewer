import { LinearProgress, Box, Theme, alpha, useTheme } from '@mui/material';
import { useFileHandler } from './helpers/useFileHandler';
import { useBinaryFilesStore } from '../../../../stores/BinaryFilesStore';
import { GxDropzoneButton } from '../../../../shared/components/GxDropzoneButton/GxDropzoneButton';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { TranscriptDropzoneButtonProps } from './TranscriptDropzoneButton.types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { humanFileSize } from '../../../../utils/utils';
import { TRANSCRIPT_FILEZ_SIZE_LIMIT } from '../../../../shared/constants';

export default function TranscriptDropzoneButton({ setLockSwitch }: TranscriptDropzoneButtonProps) {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { dropzoneProps, loading, progress } = useFileHandler();

  const fileName = useBinaryFilesStore((store) => store.fileName);
  const source = useViewerStore((store) => store.source);

  useEffect(() => {
    setLockSwitch(loading);
  }, [setLockSwitch, loading]);

  return (
    <Box>
      <GxDropzoneButton
        labelTitle={t('sourceFiles.transcriptsFileInputLabel')}
        labelText={fileName}
        buttonText={t('sourceFiles.transcriptsFileUploadButton')}
        disabled={!source}
        helperText={t('sourceFiles.uploadedFileSizeHelper', { size: humanFileSize(TRANSCRIPT_FILEZ_SIZE_LIMIT, 0) })}
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
}

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
