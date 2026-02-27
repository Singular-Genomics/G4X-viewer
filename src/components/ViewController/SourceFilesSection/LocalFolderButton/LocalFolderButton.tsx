import { Button, alpha, Theme, useTheme, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useTranslation } from 'react-i18next';
import { useDirectoryPicker } from './useDirectoryPicker.hook';

export const LocalFolderButton = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { inputRef, openDirectory, handleFiles } = useDirectoryPicker();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <Tooltip
        title={t('tooltips.sourceFiles.folderUploadButton')}
        arrow
      >
        <Button
          fullWidth
          variant="outlined"
          sx={sx.folderButton}
          size="small"
          onClick={openDirectory}
          startIcon={<FolderOpenIcon />}
        >
          {t('sourceFiles.folderUploadButton')}
        </Button>
      </Tooltip>
    </>
  );
};

const styles = (theme: Theme) => ({
  folderButton: {
    borderStyle: 'dashed',
    width: '100%',
    height: '40px',
    fontWeight: 700,
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    '&:hover': {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2)
    },
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease'
  }
});
