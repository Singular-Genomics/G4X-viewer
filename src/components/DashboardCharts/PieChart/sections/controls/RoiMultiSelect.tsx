import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GxMultiSelect, GxMultiSelectOption } from '../../../../../shared/components/GxMultiSelect';

type RoiMultiSelectProps = {
  selectedRois: number[];
  availableRois: number[];
  onChange: (rois: number[]) => void;
};

export const RoiMultiSelect = ({ selectedRois, availableRois, onChange }: RoiMultiSelectProps) => {
  const { t } = useTranslation();

  const roiOptions: GxMultiSelectOption[] = useMemo(() => {
    return availableRois.map((polygonId) => ({
      value: String(polygonId),
      label: t('pieChart.roiTitle', { polygonId })
    }));
  }, [availableRois, t]);

  const handleChange = (newValues: string[]) => {
    const sortedRois = newValues.map(Number).sort((a, b) => a - b);
    onChange(sortedRois);
  };

  return (
    <Box sx={sx.container}>
      <Typography
        variant="body2"
        sx={sx.label}
      >
        {t('pieChart.selectRoi')}
      </Typography>
      <GxMultiSelect
        options={roiOptions}
        value={selectedRois.map(String)}
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
