import { Box, Divider, ListSubheader, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { COLORMAP_OPTIONS } from '../../../../shared/constants';
import { GxSelect } from '../../../../shared/components/GxSelect/GxSelect';
import { useTranslation } from 'react-i18next';

export const ColormapSelector = () => {
  const { t } = useTranslation();
  const sx = styles(useTheme());
  const colormap = useViewerStore((store) => store.colormap);
  const handleChange = (newValue: string) => {
    useViewerStore.setState({ colormap: newValue });
  };

  return (
    <Box sx={sx.container}>
      <GxSelect
        sx={sx.select}
        inputProps={{ 'aria-label': t('channelSettings.colormapSelect') }}
        value={colormap}
        displayEmpty
        defaultValue=""
        onChange={(e) => handleChange(e.target.value as string)}
        fullWidth
      >
        <ListSubheader sx={sx.groupHeader}>{t('channelSettings.groupBlending')}</ListSubheader>
        <MenuItem
          value=""
          disableTouchRipple
        >
          <Typography sx={sx.colormapSelectText}>{t('channelSettings.additive')}</Typography>
        </MenuItem>
        <Divider sx={sx.groupDivider} />
        <ListSubheader sx={sx.groupHeader}>{t('channelSettings.groupColorMaps')}</ListSubheader>
        {COLORMAP_OPTIONS.map((option) => (
          <MenuItem
            key={option}
            value={option}
            disableTouchRipple
          >
            <Typography sx={sx.colormapSelectText}>{option}</Typography>
          </MenuItem>
        ))}
      </GxSelect>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  select: {
    height: '36px',
    '& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        border: 0
      }
  },
  container: {
    width: '100%',
    maxWidth: '200px',
    marginLeft: 'auto'
  },
  groupHeader: {
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'none',
    letterSpacing: '0.05em',
    color: theme.palette.primary.main,
    lineHeight: '28px',
    paddingTop: '4px',
    paddingBottom: 0
  },
  groupDivider: {
    borderColor: theme.palette.divider,
    marginTop: '4px',
    marginBottom: '4px'
  },
  colormapSelectText: {
    textTransform: 'capitalize'
  }
});
