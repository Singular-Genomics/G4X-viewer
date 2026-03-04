import { useCallback, useEffect, useState } from 'react';
import { GxInput } from '../../../../../shared/components/GxInput';
import { Box, Button, Theme, useTheme } from '@mui/material';
import { GraphRangeInputsProps, InputConfig, InputErrors, InputFieldType, InputRange } from './GraphRangeInputs.types';
import { useTranslation } from 'react-i18next';

const INPUT_FIELDS: InputConfig[] = [
  {
    field: 'xStart',
    label: 'X Start',
    validateValue: (value, filter) => value < filter.xStart,
    updateFilter: (value, filter) => ({
      ...filter,
      xStart: value
    })
  },
  {
    field: 'xEnd',
    label: 'X End',
    validateValue: (value, filter) => value > filter.xEnd,
    updateFilter: (value, filter) => ({
      ...filter,
      xEnd: value
    })
  },
  {
    field: 'yStart',
    label: 'Y Start',
    validateValue: (value, filter) => value < filter.yStart,
    updateFilter: (value, filter) => ({
      ...filter,
      yEnd: value
    })
  },
  {
    field: 'yEnd',
    label: 'Y End',
    validateValue: (value, filter) => value > filter.yEnd,
    updateFilter: (value, filter) => ({
      ...filter,
      yStart: value
    })
  }
];

export function GraphRangeInputs({
  rangeSource,
  savedRange,
  inputPrecission,
  onUpdateRange,
  onClear,
  onConfirm
}: GraphRangeInputsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const [rangeInput, setRangeInput] = useState<InputRange>({
    xStart: '',
    xEnd: '',
    yStart: '',
    yEnd: ''
  });
  const [errors, setErrors] = useState<InputErrors>({});

  useEffect(() => {
    if (rangeSource) {
      setRangeInput({
        xStart: rangeSource.xStart.toFixed(inputPrecission || 0).toString(),
        xEnd: rangeSource.xEnd.toFixed(inputPrecission || 0).toString(),
        yStart: rangeSource.yEnd.toFixed(inputPrecission || 0).toString(),
        yEnd: rangeSource.yStart.toFixed(inputPrecission || 0).toString()
      });
      setErrors({});
    }
  }, [rangeSource, inputPrecission]);

  const handleInputClear = useCallback(() => {
    setRangeInput({
      xStart: '',
      xEnd: '',
      yStart: '',
      yEnd: ''
    });
    onClear();
    setErrors({});
  }, [onClear]);

  const handleInputChange = useCallback(
    (newValueString: string, field: InputFieldType) => {
      setRangeInput((prev) => ({
        ...prev,
        [field]: newValueString
      }));

      if (!rangeSource || !newValueString) return;

      const numValue = Number(newValueString);
      const fieldConfig = INPUT_FIELDS.find((config) => config.field === field);

      if (!fieldConfig) return;

      const isValid = fieldConfig.validateValue(numValue, rangeSource);

      if (isValid) {
        onUpdateRange(fieldConfig.updateFilter(numValue, rangeSource));

        setErrors((prev) => ({
          ...prev,
          [field]: false
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [field]: true
        }));
      }
    },
    [rangeSource, onUpdateRange]
  );

  const isValidRange = rangeInput.xStart && rangeInput.xEnd && rangeInput.yStart && rangeInput.yEnd;

  const hasChanges = useCallback(() => {
    if (!rangeSource || !savedRange) return true;

    return (
      rangeSource.xStart !== savedRange.xStart ||
      rangeSource.xEnd !== savedRange.xEnd ||
      rangeSource.yStart !== savedRange.yStart ||
      rangeSource.yEnd !== savedRange.yEnd
    );
  }, [rangeSource, savedRange]);

  const isApplyDisabled = !isValidRange || !hasChanges();

  return (
    <Box sx={sx.inputWrapper}>
      {INPUT_FIELDS.map(({ field, label }) => (
        <GxInput
          key={field}
          value={rangeInput[field]}
          onChange={(e) => handleInputChange(e.target.value, field)}
          label={label}
          type="number"
          size="small"
          error={!!errors[field]}
        />
      ))}
      <Button
        onClick={handleInputClear}
        fullWidth
        disabled={!isValidRange}
        sx={sx.clearButton}
      >
        {t('general.clear')}
      </Button>
      <Button
        onClick={onConfirm}
        fullWidth
        disabled={isApplyDisabled}
        sx={sx.confirmButton}
      >
        {t('general.apply')}
      </Button>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  inputWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr) 100px 100px',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '8px',
    paddingBlock: '16px',
    height: 'min-content',
    marginTop: 'auto',
    backgroundColor: theme.palette.gx.primary.white,
    paddingInline: '8px'
  },
  clearButton: {
    height: '100%',
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    background: theme.palette.gx.primary.white,
    '&.Mui-disabled': {
      borderColor: theme.palette.gx.mediumGrey[300],
      color: theme.palette.gx.mediumGrey[300]
    }
  },
  confirmButton: {
    height: '100%',
    color: theme.palette.gx.primary.white,
    background: theme.palette.gx.gradients.brand(),
    '&.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[300]
    }
  }
});
