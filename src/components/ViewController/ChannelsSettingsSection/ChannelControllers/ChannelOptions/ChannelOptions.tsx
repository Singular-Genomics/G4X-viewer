import { ClickAwayListener, IconButton, MenuList, Paper, Popper, Theme, Tooltip, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChannelOptionsProps } from './ChannelOption.types';
import { useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ColorPalette } from './ColorPalette';
import { SliderThreshold } from './SliderRange/SliderThreshold';

export const ChannelOptions = ({
  handleColorSelect,
  disabled,
  rangeMin,
  rangeMax,
  setRangeMin,
  setRangeMax,
  setMinInputValue,
  setMaxInputValue
}: ChannelOptionsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <>
      <Tooltip
        title={t('channelSettings.channelOptionsTooltip')}
        arrow
      >
        <IconButton
          size="small"
          onClick={() => setIsOpen((prev) => !prev)}
          ref={anchorRef}
          disabled={disabled}
          sx={sx.channelOptionsButton}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom-end"
      >
        <Paper sx={sx.channelOptionsPaper}>
          <ClickAwayListener onClickAway={() => setIsOpen((prev) => !prev)}>
            <MenuList>
              <ColorPalette handleColorSelect={handleColorSelect} />
              <SliderThreshold
                rangeMin={rangeMin}
                rangeMax={rangeMax}
                setRangeMin={setRangeMin}
                setRangeMax={setRangeMax}
                setMinInputValue={setMinInputValue}
                setMaxInputValue={setMaxInputValue}
              />
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
};

const styles = (theme: Theme) => ({
  channelOptionsPaper: {
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.75),
    padding: '4px'
  },
  channelOptionsButton: {
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  }
});
