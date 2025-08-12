import { Box, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { GxInput } from '../../../../../../shared/components/GxInput';
import { useEffect, useMemo, useState } from 'react';
import { InputErrors } from './UmapGraphHeader.types';
import { useUmapGraphStore } from '../../../../../../stores/UmapGraphStore/UmapGraphStore';
import { debounce } from 'lodash';
import HelpIcon from '@mui/icons-material/Help';
import { useTranslation } from 'react-i18next';

const MIN_POINT_SIZE = 1;
const MAX_POINT_SIZE = 10;
const MIN_SUBSAMPLE_VALUE = 1;
const MAX_SUBSAMPLE_VALUE = 20;

export const UmapGraphHeader = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const { updateSettings } = useUmapGraphStore();
  const [errors, setErrors] = useState<InputErrors>({});
  const [pointSizeInput, setPointSizeInput] = useState('');
  const [subsamplingInput, setSubsamplingInput] = useState('');

  useEffect(() => {
    const { pointSize, subsamplingValue } = useUmapGraphStore.getState().settings;

    if (pointSize) {
      setPointSizeInput(pointSize.toString());
    } else {
      setPointSizeInput(MIN_POINT_SIZE.toString());
    }

    if (subsamplingValue) {
      setSubsamplingInput(subsamplingValue.toString());
    } else {
      setSubsamplingInput(MIN_SUBSAMPLE_VALUE.toString());
    }
  }, []);

  const debouncedSettingsUpdate = useMemo(
    () =>
      debounce((newSettings) => {
        updateSettings(newSettings);
      }, 250),
    [updateSettings]
  );

  const handlePointSizeChange = (newValue: string) => {
    setPointSizeInput(newValue);
    if (!newValue) {
      setErrors((prev) => ({ ...prev, pointSize: '' }));
      return;
    } else if (!/^[0-9]*$/.test(newValue)) {
      setErrors((prev) => ({ ...prev, pointSize: t('general.invalidValue') }));
      return;
    } else if (Number(newValue) < MIN_POINT_SIZE) {
      setErrors((prev) => ({ ...prev, pointSize: `Min. ${MIN_POINT_SIZE}` }));
      return;
    } else if (Number(newValue) > MAX_POINT_SIZE) {
      setErrors((prev) => ({ ...prev, pointSize: `Max. ${MAX_POINT_SIZE}` }));
      return;
    }

    debouncedSettingsUpdate({ pointSize: Number(newValue) });
  };

  const handleSubsamplingChange = (newValue: string) => {
    setSubsamplingInput(newValue);
    if (!newValue) {
      setErrors((prev) => ({ ...prev, subsamplingValue: '' }));
      return;
    } else if (!/^[0-9]*$/.test(newValue)) {
      setErrors((prev) => ({ ...prev, subsamplingValue: t('general.invalidValue') }));
      return;
    } else if (Number(newValue) < MIN_SUBSAMPLE_VALUE) {
      setErrors((prev) => ({ ...prev, subsamplingValue: `Min. ${MIN_SUBSAMPLE_VALUE}` }));
      return;
    } else if (Number(newValue) > MAX_SUBSAMPLE_VALUE) {
      setErrors((prev) => ({ ...prev, subsamplingValue: `Max. ${MAX_SUBSAMPLE_VALUE}` }));
      return;
    }

    debouncedSettingsUpdate({
      subsamplingValue: Number(newValue)
    });
  };

  return (
    <Box sx={sx.headerWrapper}>
      <Typography sx={sx.inputLabel}>{t('segmentationSettings.umapMenuPointSize')}</Typography>
      <GxInput
        value={pointSizeInput}
        onChange={(e) => handlePointSizeChange(e.target.value)}
        error={!!errors.pointSize}
        helperText={errors.pointSize || `Min. ${MIN_POINT_SIZE} | Max. ${MAX_POINT_SIZE}`}
        type="number"
        sx={sx.inputField}
      />
      <Box sx={sx.subsamplingWrapper}>
        <Typography sx={sx.inputLabel}>{t('segmentationSettings.umapMenuSubsamplingStep')}</Typography>
        <Tooltip
          placement="top"
          arrow
          enterDelay={250}
          title={t('segmentationSettings.umapMenuSubsamplingStepTooltip')}
        >
          <HelpIcon sx={sx.helpIcon} />
        </Tooltip>
      </Box>

      <GxInput
        value={subsamplingInput}
        onChange={(e) => handleSubsamplingChange(e.target.value)}
        error={!!errors.subsamplingValue}
        helperText={errors.subsamplingValue || `Min. ${MIN_SUBSAMPLE_VALUE} | Max. ${MAX_SUBSAMPLE_VALUE}`}
        type="number"
        sx={sx.inputField}
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  headerWrapper: {
    display: 'flex',
    height: 'min-content',
    backgroundColor: theme.palette.gx.primary.white,
    gap: '16px',
    padding: '8px 8px 0 8px'
  },
  inputLabel: {
    textAlign: 'right',
    textWrap: 'nowrap',
    fontWeight: 'bold',
    marginTop: '16px'
  },
  helpIcon: {
    marginTop: '16px',
    color: theme.palette.gx.mediumGrey[100]
  },
  subsamplingWrapper: {
    display: 'flex',
    gap: '8px'
  },
  inputField: {
    '& .MuiFormHelperText-root': {
      marginTop: '0px'
    }
  }
});
