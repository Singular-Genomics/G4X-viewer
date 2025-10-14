import { Box, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GxMultiSelect, GxMultiSelectOption } from '../../../../shared/components/GxMultiSelect';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';

type RoiMultiSelectProps = {
  selectedRois: number[];
  onChange: (rois: number[]) => void;
};

export const RoiMultiSelect = ({ selectedRois, onChange }: RoiMultiSelectProps) => {
  const { t } = useTranslation();
  const [polygonFeatures] = usePolygonDrawingStore(useShallow((store) => [store.polygonFeatures]));

  const roiOptions: GxMultiSelectOption[] = useMemo(() => {
    return polygonFeatures
      .map((feature) => {
        const polygonId = feature.properties?.polygonId;
        if (polygonId === undefined) return null;
        return {
          value: String(polygonId),
          label: t('pieChart.roiTitle', { polygonId })
        };
      })
      .filter((option): option is GxMultiSelectOption => option !== null)
      .sort((a, b) => Number(a.value) - Number(b.value));
  }, [polygonFeatures, t]);

  useEffect(() => {
    const validRois = selectedRois.filter((roiId) => roiOptions.some((opt) => Number(opt.value) === roiId));
    if (validRois.length !== selectedRois.length) {
      onChange(validRois);
    }
  }, [roiOptions, selectedRois, onChange]);

  const handleChange = (newValues: string[]) => {
    onChange(newValues.map(Number));
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
