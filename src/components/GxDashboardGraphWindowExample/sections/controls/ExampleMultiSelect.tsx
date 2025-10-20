import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GxMultiSelect, GxMultiSelectOption } from '../../../../shared/components/GxMultiSelect';

const OPTIONS: GxMultiSelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
  { value: 'option5', label: 'Option 5' }
];

export const ExampleMultiSelect = () => {
  const { t } = useTranslation();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleChange = (newValues: string[]) => {
    setSelectedValues(newValues);
  };

  return (
    <Box sx={sx.container}>
      <Typography
        variant="body2"
        sx={sx.label}
      >
        Multi Select
      </Typography>
      <GxMultiSelect
        options={OPTIONS}
        value={selectedValues}
        onChange={(e) => handleChange(e.target.value as string[])}
        placeholder={t('general.multiSelectPlaceholder')}
        colorVariant="dark"
        fullWidth
      />
    </Box>
  );
};

const sx = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: '200px'
  },
  label: {
    fontWeight: 500
  }
};
