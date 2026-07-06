import {
  ClickAwayListener,
  Divider,
  IconButton,
  MenuList,
  Paper,
  Popper,
  Theme,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChannelOptionsProps } from './ChannelOption.types';
import { useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { GxColorPicker } from '../../../../../shared/components/GxColorPicker/GxColorPicker';
import { ColorHsv } from '../../../../../shared/components/GxColorPicker/GxColorPicker.types';
import { HsvToRgb, RgbToHsv } from '../../../../../shared/components/GxColorPicker/GxColorPicker.helpers';
import { COLOR_PALLETE } from '../../../../../shared/constants';
import { SliderThreshold } from './SliderRange/SliderThreshold';

export const ChannelOptions = ({
  color,
  slider,
  domain,
  handleColorSelect,
  disabled,
  rangeMin,
  rangeMax,
  setRangeMin,
  setRangeMax,
  setMinInputValue,
  setMaxInputValue,
  handleSliderChange
}: ChannelOptionsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const [pickerColor, setPickerColor] = useState<ColorHsv>(RgbToHsv({ r: color[0], g: color[1], b: color[2] }));

  const handleConfirmColor = () => {
    const rgb = HsvToRgb(pickerColor);
    handleColorSelect([rgb.r, rgb.g, rgb.b]);
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setPickerColor(RgbToHsv({ r: color[0], g: color[1], b: color[2] }));
      }
      return nextOpen;
    });
  };

  return (
    <>
      <Tooltip
        title={t('channelSettings.channelOptionsTooltip')}
        arrow
      >
        <IconButton
          size="small"
          onClick={handleToggleOpen}
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
              <GxColorPicker
                color={pickerColor}
                handleColorChange={setPickerColor}
                handleConfirm={handleConfirmColor}
                predefinedColors={COLOR_PALLETE}
              />
              <Divider sx={sx.divider} />
              <SliderThreshold
                slider={slider}
                domain={domain}
                rangeMin={rangeMin}
                rangeMax={rangeMax}
                setRangeMin={setRangeMin}
                setRangeMax={setRangeMax}
                setMinInputValue={setMinInputValue}
                setMaxInputValue={setMaxInputValue}
                handleSliderChange={handleSliderChange}
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
    padding: '8px',
    width: '272px'
  },
  channelOptionsButton: {
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  },
  divider: {
    borderColor: theme.palette.gx.mediumGrey[500],
    marginTop: '16px',
    marginBottom: '16px'
  }
});
