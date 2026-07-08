import { calculateExpandedRange, getPixelValueDisplay, MORPHOLOGY_KEYWORDS } from './ChannelController.helpers';
import { ChannelControllerProps, SliderRangeMode } from './ChannelController.types';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  ListSubheader,
  MenuItem,
  Radio,
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
import { InfoTooltip } from '../../../../InfoTooltip';

export const ChannelController = ({
  color,
  defaultColor,
  domain,
  name,
  isLoading,
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
    <Grid
      container
      direction="column"
      justifyContent="center"
      gap={0.5}
    >
      <Box sx={sx.headerWrapper}>
        <Tooltip
          title={t(isSoloed ? 'channelSettings.exitSolo' : 'channelSettings.solo')}
          enterDelay={300}
          arrow
        >
          <Radio
            checked={isSoloed}
            onClick={onSoloToggle}
            size="small"
            disableTouchRipple
            sx={sx.soloRadio}
          />
        </Tooltip>
        <Box sx={isSoloMode ? sx.selectDimmed : undefined}>
          <GxCheckbox
            onChange={isSoloMode ? toggleSelectInSoloMode : toggleIsOn}
            disabled={isLoading}
            checked={isSoloMode ? presoloVisible : channelVisible}
            disableTouchRipple
          />
        </Box>
        <Box sx={sx.valueWrapper}>
          <Box>{getPixelValueDisplay(pixelValue, isLoading)}</Box>
        </Box>
        <InfoTooltip title={t('tooltips.channelSettings.currentPixelIntensity')} />
        <GxSelect
          value={name}
          onChange={(e) => onSelectionChange(e.target.value as string)}
          sx={sx.channelSelect}
          disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
                key={opt}
                value={opt}
              >
                <Typography>{opt}</Typography>
              </MenuItem>
            ))
          ]}
        </GxSelect>
        <Box>
          <ChannelOptions
            color={color}
            defaultColor={defaultColor}
            slider={slider}
            domain={domain}
            handleColorSelect={handleColorSelect as any}
            disabled={isLoading}
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
          isLoading={isLoading}
          visibleMin={visibleRange.min}
          visibleMax={visibleRange.max}
          minInputValue={minInputValue}
          maxInputValue={maxInputValue}
          setMinInputValue={setMinInputValue}
          setMaxInputValue={setMaxInputValue}
        />
        <Box sx={sx.sliderRowIcons}>
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
              disabled={isLoading}
              sx={sx.modeToggleButton}
            >
              {sliderRangeMode === 'expanded' ? (
                <UnfoldMoreIcon fontSize="small" />
              ) : (
                <UnfoldLessIcon fontSize="small" />
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
                onClick={handleResetSlider}
                disabled={isLoading || (slider[0] === defaultSlider[0] && slider[1] === defaultSlider[1])}
                sx={sx.sliderRowButton}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Grid>
  );
};

const styles = (theme: Theme) => ({
  soloRadio: {
    padding: '8px',
    paddingRight: '2px',
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
  headerWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  valueWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 6px',
    borderRadius: '8px',
    background: theme.palette.gx.primary.white,
    flexGrow: 0.5,
    minWidth: '110px',
    maxWidth: '110px'
  },
  channelSelect: {
    flexGrow: 1,
    minWidth: 0
  },
  groupHeader: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.palette.gx.accent.greenBlue,
    lineHeight: '28px',
    paddingTop: '4px',
    paddingBottom: '0'
  },
  groupDivider: {
    borderColor: theme.palette.gx.lightGrey[500],
    marginTop: '4px',
    marginBottom: '4px'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  sliderRowIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0
  },
  sliderRowButton: {
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  },
  modeToggleButton: {
    transform: 'rotate(90deg)',
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
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
