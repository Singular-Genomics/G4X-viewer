import { useCallback, useEffect, useState } from 'react';
import { GxInput } from '../../../../../shared/components/GxInput';
import { Box, Button, Theme, useTheme } from '@mui/material';
import { GraphRangeInputsProps, InputConfig, InputErrors, InputFieldType, InputRange } from './GraphRangeInputs.types';

const INPUT_FIELDS: InputConfig[] = [
  {
    field: 'xStart',
    label: 'X Start',
    validateValue: (value, filter) => value < filter.xRangeEnd,
    updateFilter: (value, filter) => ({
      ...filter,
      xRangeStart: value
    })
  },
  {
    field: 'xEnd',
    label: 'X End',
    validateValue: (value, filter) => value > filter.xRangeStart,
    updateFilter: (value, filter) => ({
      ...filter,
      xRangeEnd: value
    })
  },
  {
    field: 'yStart',
    label: 'Y Start',
    validateValue: (value, filter) => value < filter.yRangeStart,
    updateFilter: (value, filter) => ({
      ...filter,
      yRangeEnd: value
    })
  },
  {
    field: 'yEnd',
    label: 'Y End',
    validateValue: (value, filter) => value > filter.yRangeEnd,
    updateFilter: (value, filter) => ({
      ...filter,
      yRangeStart: value
    })
  }
];

export function GraphRangeInputs({ rangeSource, onUpdateRange, onClear }: GraphRangeInputsProps) {
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
        xStart: Math.round(rangeSource.xRangeStart).toString(),
        xEnd: Math.round(rangeSource.xRangeEnd).toString(),
        yStart: Math.round(rangeSource.yRangeEnd).toString(),
        yEnd: Math.round(rangeSource.yRangeStart).toString()
      });
      setErrors({});
    }
  }, [rangeSource]);

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
        sx={sx.clearButton}
      >
        Clear
      </Button>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  inputWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr) 100px',
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
    fontWeight: 700,
    height: '100%',
    color: theme.palette.gx.primary.white,
    background: theme.palette.gx.gradients.brand()
  }
});
