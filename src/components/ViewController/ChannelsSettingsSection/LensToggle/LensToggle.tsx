import { Box, Collapse, FormControlLabel, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import { GxSelect } from '../../../../shared/components/GxSelect/GxSelect';
import { useChannelsStore } from '../../../../stores/ChannelsStore/ChannelsStore';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

export const LensToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const selections = useChannelsStore((store) => store.selections);
  const [isLensOn, lensSelection, channelOptions, toggleLens] = useViewerStore(
    useShallow((store) => [store.isLensOn, store.lensSelection, store.channelOptions, store.toggleLens])
  );

  const currentChannelIndices = selections.map((sel) => sel.c);

  return (
    <Box>
      <FormControlLabel
        label={t('channelSettings.lens')}
        control={
          <GxCheckbox
            onChange={toggleLens}
            checked={isLensOn}
            disableTouchRipple
          />
        }
      />
      <Collapse
        in={isLensOn}
        sx={sx.subSectionWrapper}
      >
        <Typography sx={sx.selectTitle}>{`${t('channelSettings.highlightedChannel')}:`}</Typography>
        <GxSelect
          value={lensSelection}
          fullWidth
          onChange={(e) =>
            useViewerStore.setState({
              lensSelection: e.target.value as number
            })
          }
        >
          {currentChannelIndices.map((channelIndex, relativeIndex) => (
            <MenuItem
              key={channelOptions[channelIndex as number] + String(relativeIndex)}
              value={relativeIndex}
            >
              <Typography>{channelOptions[channelIndex as number]}</Typography>
            </MenuItem>
          ))}
        </GxSelect>
      </Collapse>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  subSectionWrapper: {
    marginLeft: '32px',
    borderLeft: `5px solid ${theme.palette.gx.mediumGrey[100]}`,
    paddingLeft: '8px'
  },
  selectTitle: {
    marginBottom: '4px'
  }
});
