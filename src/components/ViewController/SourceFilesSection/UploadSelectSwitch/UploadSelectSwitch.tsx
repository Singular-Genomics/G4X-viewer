import { Theme, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { UploadSelectSwitchProps, UPLOAD_MODES } from './UploadSelectSwitch.types';
import React from 'react';
import { useTranslation } from 'react-i18next';

export function UploadSelectSwitch({ uploadMode, onUploadModeChange, disabled }: UploadSelectSwitchProps) {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: any) => {
    if (!!value && value !== uploadMode) {
      onUploadModeChange(value);
    }
  };

  return (
    <ToggleButtonGroup
      sx={sx.toggleButtonGroup}
      exclusive
      fullWidth
      value={uploadMode}
      onChange={handleChange}
      disabled={disabled}
    >
      <ToggleButton
        sx={sx.toggleButton}
        value={UPLOAD_MODES.MULTI_FILE}
      >
        <UploadIcon />
        <Typography sx={sx.toggleButtonLabel}>{t('sourceFiles.multiFileButtonLabel')}</Typography>
      </ToggleButton>
      <ToggleButton
        sx={sx.toggleButton}
        value={UPLOAD_MODES.SINGLE_FILE}
      >
        <UploadFileIcon />
        <Typography sx={sx.toggleButtonLabel}>{t('sourceFiles.singleFileButtonLabel')}</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

const styles = (theme: Theme) => ({
  toggleButtonGroup: {
    marginBottom: '16px'
  },
  toggleButton: {
    width: '100%',
    display: 'flex',
    gap: '8px',
    '&.Mui-selected.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[100]
    },
    '&.Mui-selected': {
      background: theme.palette.gx.gradients.brand(),
      color: theme.palette.gx.primary.white
    }
  },
  toggleButtonLabel: {
    fontSize: '11px',
    textWrap: 'nowrap'
  }
});
