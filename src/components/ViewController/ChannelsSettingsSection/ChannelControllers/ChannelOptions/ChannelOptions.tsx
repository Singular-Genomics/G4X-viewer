import { SettingsTooltip as Tooltip } from '../../../../../shared/components/SettingsHelp';
import {
  ClickAwayListener,
  // Divider,
  IconButton,
  MenuList,
  Paper,
  Popper,
  SvgIcon,
  Theme,
  alpha,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChannelOptionsProps } from './ChannelOption.types';
import { useRef, useState } from 'react';
import { GxColorPicker } from '../../../../../shared/components/GxColorPicker/GxColorPicker';
import { ColorHsv } from '../../../../../shared/components/GxColorPicker/GxColorPicker.types';
import { HsvToRgb, RgbToHsv } from '../../../../../shared/components/GxColorPicker/GxColorPicker.helpers';
// import { SliderThreshold } from './SliderRange/SliderThreshold';

export const ChannelOptions = ({
  channelName,
  color,
  defaultColor,
  handleColorSelect,
  disabled
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
        title={t('settingsHelp.controls.channelColor')}
        helpTitle={channelName}
        arrow
      >
        <IconButton
          size="small"
          aria-label={t('channelSettings.channelOptionsTooltip')}
          onClick={handleToggleOpen}
          ref={anchorRef}
          disabled={disabled}
          sx={sx.channelOptionsButton}
        >
          <SvgIcon
            fontSize="small"
            viewBox="0 0 24 24"
          >
            <path d="M3,21V16.25L11.95,7.3L10.5,5.9l1.45-1.4l1.9,1.9l3.1-3.1q0.13-0.13 0.31-0.2t0.39-0.07T18.03,3.1t0.32,0.2L20.7,5.65q0.13,0.15 0.2,0.32t0.07,0.38T20.9,6.74T20.7,7.05l-3.08,3.07l1.9,1.95L18.1,13.5l-1.4-1.45L7.75,21H3Zm2-2H6.95l8.3-8.35l-1.9-1.9L5,17.05V19ZM16.18,8.75l2.4-2.4L17.65,5.43l-2.4,2.4l0.93,0.93Zm0,0L15.25,7.82l0.93,0.93Z" />
          </SvgIcon>
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
                defaultColor={RgbToHsv({ r: defaultColor[0], g: defaultColor[1], b: defaultColor[2] })}
              />
              {/* <Divider sx={sx.divider} />
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
              /> */}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
};

const styles = (theme: Theme) => ({
  channelOptionsPaper: {
    backgroundColor: alpha(theme.palette.background.level1, 0.94),
    padding: '8px',
    width: '272px'
  },
  channelOptionsButton: {
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  },
  divider: {
    borderColor: theme.palette.divider,
    marginTop: '16px',
    marginBottom: '16px'
  }
});
