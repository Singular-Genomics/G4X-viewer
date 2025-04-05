import { LinearProgress, Box, Theme, alpha, useTheme } from '@mui/material';
import { useFileHandler } from './helpers/useFileHandler';
import { useBinaryFilesStore } from '../../../../stores/BinaryFilesStore';
import { GxDropzoneButton } from '../../../../shared/components/GxDropzoneButton/GxDropzoneButton';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { TranscriptDropzoneButtonProps } from './TranscriptDropzoneButton.types';
import { useEffect } from 'react';

export default function TranscriptDropzoneButton({ setLockSwitch }: TranscriptDropzoneButtonProps) {
  const theme = useTheme();
  const sx = styles(theme);
  const { dropzoneProps, loading, progress } = useFileHandler();
  const fileName = useBinaryFilesStore((store) => store.fileName);
  const source = useViewerStore((store) => store.source);

  useEffect(() => {
    setLockSwitch(loading);
  }, [setLockSwitch, loading]);

  return (
    <Box>
      <GxDropzoneButton
        labelTitle="Transcript File Name"
        labelText={fileName}
        buttonText="Upload points file"
        disabled={!source}
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
