import { alpha, Box, Button, Fade, FormControlLabel, Theme, Tooltip, useTheme } from '@mui/material';
import { BrightfieldImageSelectorEntryProps } from './BrightfieldImageSelectorEntry.types';
import ClearIcon from '@mui/icons-material/Clear';
import { GxRadio } from '../../../../../shared/components/GxRadio';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudIcon from '@mui/icons-material/Cloud';
import { useTranslation } from 'react-i18next';

export const BrightfieldImageSelectorEntry = ({
  imageEntry,
  isActive,
  entryType,
  onSelectImage,
  onRemoveImage
}: BrightfieldImageSelectorEntryProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const entryName = typeof imageEntry === 'string' ? imageEntry : imageEntry.name;

  const fileName = entryName.split('/').pop();
  const imageName = fileName ? fileName.split('.').shift() : '';

  return (
    <Box sx={sx.entryContainer}>
      <FormControlLabel
        label={imageName}
        labelPlacement="end"
        control={
          <Box>
            <GxRadio
              value={entryName}
              checked={isActive}
              onClick={() => onSelectImage(imageEntry)}
              sx={sx.radioButton}
            />
          </Box>
        }
        sx={sx.entryTitle}
      />
      <Tooltip
        placement="left"
        arrow
        slots={{
          transition: Fade
        }}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -8]
                }
              }
            ]
          }
        }}
        sx={sx.entryTypeTooltip}
        title={entryType === 'local-file' ? t('fileLocal') : t('fileCloud')}
      >
        {entryType === 'local-file' ? <InsertDriveFileIcon fontSize="small" /> : <CloudIcon fontSize="small" />}
      </Tooltip>
      <Button
        onClick={() => onRemoveImage(entryName)}
        sx={sx.removeButton}
      >
        <ClearIcon sx={sx.removeIcon} />
      </Button>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  entryContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.gx.lightGrey[900],
    borderRadius: '8px',
    height: '42px'
  },
  entryTitle: {
    width: '100%',
    marginLeft: '0'
  },
  radioButton: {
    pointerEvents: 'none',
    marginRight: '8px'
  },
  entryTypeTooltip: {
    marginRight: '8px',
    color: theme.palette.gx.mediumGrey[500]
  },
  removeButton: {
    minWidth: 'unset',
    width: '42px',
    height: '42px',
    borderRadius: '0',
    padding: '0',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.accent.error, 0.04)
    }
  },
  removeIcon: {
    width: '100%',
    height: '100%',
    padding: '8px',
    color: theme.palette.gx.darkGrey[500],
    '&:hover': {
      color: theme.palette.gx.accent.error
    }
  }
});
