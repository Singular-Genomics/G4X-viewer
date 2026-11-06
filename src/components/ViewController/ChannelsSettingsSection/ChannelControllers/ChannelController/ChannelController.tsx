import { calculateExpandedRange, getPixelValueDisplay, MORPHOLOGY_KEYWORDS } from './ChannelController.helpers';
import { ChannelControllerProps, SliderRangeMode } from './ChannelController.types';
import {
  Box,
  Divider,
  IconButton,
  ListSubheader,
  MenuItem,
  Radio,
  SxProps,
  Theme,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { ChannelOptions } from '../ChannelOptions/ChannelOptions';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ChannelRangeSlider } from './ChannelRangeSlider/ChannelRangeSlider';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const ChannelController = ({
  color,
  defaultColor,
  domain,
  name,
  isLoading,
  disabled,
  pixelValue,
  channelVisible,
  slider,
  defaultSlider,
  toggleIsOn,
  onSelectionChange,
  handleColorSelect,
  handleRemoveChannel,
  handleSliderChange,
  handleResetSlider,
  isSoloed,
  isSoloMode,
  presoloVisible,
  onSoloToggle,
  toggleSelectInSoloMode
}: ChannelControllerProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const channelOptions = useViewerStore((store) => store.channelOptions);

  const isMorphology = (name: string) => MORPHOLOGY_KEYWORDS.some((kw) => name.toLowerCase().includes(kw));

  const [morphologyOptions, proteinOptions] = channelOptions.reduce(
    (result, opt): [string[], string[]] => {
      result[isMorphology(opt) ? 0 : 1].push(opt);
      return result;
    },
    [[], []] as [string[], string[]]
  );

  morphologyOptions.sort((a, b) => {
    const indexA = MORPHOLOGY_KEYWORDS.findIndex((kw) => a.toLowerCase().includes(kw));
    const indexB = MORPHOLOGY_KEYWORDS.findIndex((kw) => b.toLowerCase().includes(kw));
    return indexA - indexB;
  });

  const [currentMinValue, currentMaxValue] = slider;
  const [domainMin, domainMax] = domain;
  const [sliderRangeMode, setSliderRangeMode] = useState<SliderRangeMode>('expanded');
  const [rangeMin, setRangeMin] = useState(domainMin.toString());
  const [rangeMax, setRangeMax] = useState(domainMax.toString());
  const [minInputValue, setMinInputValue] = useState<string>(currentMinValue.toString());
  const [maxInputValue, setMaxInputValue] = useState<string>(currentMaxValue.toString());

  const [visibleRange, setVisibleRange] = useState(() => {
    const [calcMin, calcMax] = calculateExpandedRange(
      currentMinValue,
      currentMaxValue,
      Number(rangeMin),
      Number(rangeMax)
    );
    return { min: calcMin, max: calcMax };
  });

  const handleModeToggle = () => {
    setSliderRangeMode((prev) => {
      const newMode = prev === 'expanded' ? 'contract' : 'expanded';
      const rMin = Number(rangeMin);
      const rMax = Number(rangeMax);
      if (newMode === 'contract') {
        setVisibleRange({ min: rMin, max: rMax });
      } else {
        const [eMin, eMax] = calculateExpandedRange(currentMinValue, currentMaxValue, rMin, rMax);
        setVisibleRange({ min: eMin, max: eMax });
      }
      return newMode;
    });
  };

  return (
    <>
      <Box sx={sx.headerWrapper}>
        <Tooltip
          title={t(isSoloed ? 'channelSettings.exitSolo' : 'channelSettings.solo')}
          arrow
        >
          <Radio
            checked={isSoloed}
            onClick={onSoloToggle}
            disabled={disabled}
            size="small"
            disableTouchRipple
            sx={sx.soloRadio}
          />
        </Tooltip>
        <Box
          className="channel-visibility-control"
          sx={isSoloMode ? sx.selectDimmed : undefined}
        >
          <GxCheckbox
            onChange={isSoloMode ? toggleSelectInSoloMode : toggleIsOn}
            disabled={disabled}
            checked={isSoloMode ? presoloVisible : channelVisible}
            disableTouchRipple
          />
        </Box>
        <GxSelect
          value={name}
          onChange={(e) => onSelectionChange(e.target.value as string)}
          sx={sx.channelSelect}
          disabled={disabled}
        >
          {morphologyOptions.length > 0 && [
            <ListSubheader
              key="morphology-header"
              sx={sx.groupHeader}
            >
              {t('channelSettings.groupMorphology')}
            </ListSubheader>,
            ...morphologyOptions.map((opt) => (
              <MenuItem
                disabled={disabled}
                key={opt}
                value={opt}
              >
                <Typography>{opt}</Typography>
              </MenuItem>
            ))
          ]}
          {morphologyOptions.length > 0 && proteinOptions.length > 0 && (
            <Divider
              key="group-divider"
              sx={sx.groupDivider}
            />
          )}
          {proteinOptions.length > 0 && [
            <ListSubheader
              key="proteins-header"
              sx={sx.groupHeader}
            >
              {t('channelSettings.groupProteins')}
            </ListSubheader>,
            ...proteinOptions.map((opt) => (
              <MenuItem
                disabled={disabled}
                key={opt}
                value={opt}
              >
                <Typography>{opt}</Typography>
              </MenuItem>
            ))
          ]}
        </GxSelect>
        <Tooltip
          title={t('tooltips.channelSettings.currentPixelIntensity')}
          arrow
          placement="top"
        >
          <Box sx={sx.valueWrapper}>
            <Box>{getPixelValueDisplay(pixelValue, isLoading)}</Box>
          </Box>
        </Tooltip>
        <Box sx={sx.headerActions}>
          <ChannelOptions
            color={color}
            defaultColor={defaultColor}
            slider={slider}
            domain={domain}
            handleColorSelect={handleColorSelect as any}
            disabled={disabled}
            rangeMin={rangeMin}
            rangeMax={rangeMax}
            setRangeMin={setRangeMin}
            setRangeMax={setRangeMax}
            setMinInputValue={setMinInputValue}
            setMaxInputValue={setMaxInputValue}
            handleSliderChange={handleSliderChange}
          />
          <Tooltip
            title={t('channelSettings.removeChannel')}
            arrow
          >
            <IconButton
              component="span"
              size="small"
              onClick={handleRemoveChannel}
              disabled={disabled}
              sx={sx.removeChannelButton}
            >
              <HighlightOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={sx.sliderRow}>
        <ChannelRangeSlider
          color={color}
          slider={slider}
          domain={domain}
          handleSliderChange={handleSliderChange}
          isLoading={disabled}
          visibleMin={visibleRange.min}
          visibleMax={visibleRange.max}
          minInputValue={minInputValue}
          maxInputValue={maxInputValue}
          setMinInputValue={setMinInputValue}
          setMaxInputValue={setMaxInputValue}
        />
        <Box
          role="group"
          aria-label={t('channelSettings.sliderRangeSectionTitle')}
          sx={sx.sliderRowIcons}
        >
          <Tooltip
            title={t(
              sliderRangeMode === 'expanded'
                ? 'channelSettings.sliderRangeModeExpanded'
                : 'channelSettings.sliderRangeModeContract'
            )}
            arrow
          >
            <IconButton
              size="small"
              onClick={handleModeToggle}
              disabled={disabled}
              sx={sx.modeToggleButton}
              aria-pressed={sliderRangeMode === 'expanded'}
              aria-label={t(
                sliderRangeMode === 'expanded'
                  ? 'channelSettings.sliderRangeModeExpanded'
                  : 'channelSettings.sliderRangeModeContract'
              )}
            >
              {sliderRangeMode === 'expanded' ? (
                <UnfoldMoreIcon
                  fontSize="small"
                  sx={{ transform: 'rotate(90deg)' }}
                />
              ) : (
                <UnfoldLessIcon
                  fontSize="small"
                  sx={{ transform: 'rotate(90deg)' }}
                />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip
            title={t('channelSettings.resetSlider')}
            arrow
          >
            <span>
              <IconButton
                size="small"
                aria-label={t('channelSettings.resetSlider')}
                onClick={handleResetSlider}
                disabled={disabled || (slider[0] === defaultSlider[0] && slider[1] === defaultSlider[1])}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  soloRadio: {
    padding: '8px',
    paddingRight: 0,
    marginRight: '0px',
    '&, &.Mui-checked': {
      color: theme.palette.gx.accent.greenBlue
    },
    '&:hover': {
      backgroundColor: 'unset'
    }
  },
  selectDimmed: {
    opacity: 0.4
  },
  removeChannelButton: {
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 'auto'
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBlock: '0 10px',
    '& .channel-visibility-control .MuiCheckbox-root': {
      paddingLeft: 0
    }
  },
  valueWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    borderRadius: '8px',
    background: theme.palette.background.paper,
    flexGrow: 0.5,
    minWidth: '90px',
    maxWidth: '90px'
  },
  channelSelect: {
    height: '35px',
    flex: '1 1 200px',
    minWidth: 0,
    maxWidth: '200px'
  },
  groupHeader: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'none',
    letterSpacing: '0.05em',
    color: theme.palette.gx.accent.greenBlue,
    lineHeight: '28px',
    paddingTop: '4px',
    paddingBottom: '0'
  },
  groupDivider: {
    borderColor: theme.palette.divider,
    marginTop: '4px',
    marginBottom: '4px'
  },
  sliderRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '8px'
  },
  sliderRowIcons: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
    borderRadius: '6px',
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden',
    '& > span': {
      display: 'flex'
    },
    '& .MuiIconButton-root': {
      borderRadius: 0,
      padding: '2.5px 5px',
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.background.default
      },
      '&.Mui-disabled': {
        color: theme.palette.action.disabled,
        backgroundColor: 'transparent'
      },
      '&.Mui-focusVisible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px'
      }
    }
  },
  modeToggleButton: {
    borderRight: '1px solid',
    borderColor: theme.palette.divider
  },
  textField: {
    marginBottom: '8px',
    width: '60px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    },
    '&.MuiInputBase-input': {
      cursor: 'auto'
    },
    '&.MuiInputBase-root::after': {
      borderBottom: '2px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    }
  }
});
