import { Box, FormControlLabel } from '@mui/material';
import { GxSwitch } from '../../GxSwitch';
import { GxFilterTableOptionsProps } from './GxFilterTableOptions.types';

export const GxFilterTableOptions = ({
  isFilterEnabled,
  isShowDiscardedEnabled,
  onToggleFilter,
  onToggleShowDiscarded
}: GxFilterTableOptionsProps) => (
  <Box sx={sx.optionsContainer}>
    <FormControlLabel
      label="Enable Filter"
      control={
        <GxSwitch
          disableTouchRipple
          onChange={onToggleFilter}
          checked={isFilterEnabled}
        />
      }
    />
    <FormControlLabel
      label="Show Discarded"
      control={
        <GxSwitch
          disableTouchRipple
          onChange={onToggleShowDiscarded}
          checked={isShowDiscardedEnabled}
          disabled={!isFilterEnabled}
        />
      }
    />
  </Box>
);

const sx = {
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px',
    marginBottom: '8px'
  }
};
