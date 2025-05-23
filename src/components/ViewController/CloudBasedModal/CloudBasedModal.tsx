import { Box, TextField, useTheme, Theme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { CloudBasedModalProps } from './CloudBasedModal.types';
import { GxModal } from '../../../shared/components/GxModal';

export const CloudBasedModal = ({
  isOpen,
  onClose,
  onSubmit,
  url,
  onUrlChange,
  title = 'Cloud Upload',
  placeholder = 'Enter URL',
  label = 'URL'
}: CloudBasedModalProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = () => {
    if (!url.trim()) {
      enqueueSnackbar({
        message: 'Please enter a valid URL',
        variant: 'error'
      });
      return;
    }

    onSubmit(url);
  };

  return (
    <GxModal
      isOpen={isOpen}
      onClose={onClose}
      onContinue={handleSubmit}
      title={title}
      colorVariant="singular"
      iconVariant="info"
      size="small"
    >
      <Box sx={sx.modalBox}>
        <TextField
          variant="filled"
          label={label}
          size="small"
          fullWidth
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder}
          sx={sx.textField}
        />
      </Box>
    </GxModal>
  );
};

const styles = (theme: Theme) => ({
  modalBox: {
    width: '700px'
  },
  textField: {
    marginTop: 1,
    marginBottom: '8px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiInputBase-input': {
      cursor: 'auto'
    },
    '& .MuiInputBase-root::after': {
      borderBottom: '2px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    }
  }
});
