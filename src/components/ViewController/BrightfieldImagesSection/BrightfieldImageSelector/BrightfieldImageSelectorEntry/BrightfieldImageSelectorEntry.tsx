import { Box, Fade, FormControlLabel, Theme, Tooltip, useTheme } from '@mui/material';
import { BrightfieldImageSelectorEntryProps } from './BrightfieldImageSelectorEntry.types';
import { GxRadio } from '../../../../../shared/components/GxRadio';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudIcon from '@mui/icons-material/Cloud';
import { useTranslation } from 'react-i18next';

export const BrightfieldImageSelectorEntry = ({
  imageEntry,
  isActive,
  entryType,
  onSelectImage
}: BrightfieldImageSelectorEntryProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const entryName =
    typeof imageEntry === 'string' ? imageEntry : '__localZarrImage' in imageEntry ? imageEntry.name : imageEntry.name;

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
        title={entryType === 'local-file' ? t('general.fileLocal') : t('general.fileCloud')}
      >
        {entryType === 'local-file' ? <InsertDriveFileIcon fontSize="small" /> : <CloudIcon fontSize="small" />}
      </Tooltip>
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
  }
});
