import { Box, FormControl, SelectChangeEvent, SxProps, Typography } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GxMultiSelect } from '../../../../../shared/components/GxMultiSelect';
import { Theme } from '@emotion/react';
import { PieChartControlsProps } from './PieChart.Controls.types';

export const PieChartControls = ({ selectedROIs, onRoiChange }: PieChartControlsProps) => {
  const { t } = useTranslation();
  const { selectedCells } = useCellSegmentationLayerStore();

  const availableROIOptions = useMemo(
    () =>
      selectedCells
        .map((feature) => {
          const polygonId = feature.roiId;
          if (polygonId === undefined) return null;
          return {
            value: String(polygonId),
            label: t('general.roiEntry', { index: polygonId })
          };
        })
        .filter((entry) => !!entry),
    [t, selectedCells]
  );

  useEffect(() => {
    const availableId = availableROIOptions.map((entry) => Number(entry.value));
    onRoiChange(selectedROIs.filter((roiId) => availableId.includes(roiId)));
    //eslint-disable-next-line
  }, [availableROIOptions]);

  const handleRoiChange = (event: SelectChangeEvent<string[] | string>) => {
    const value = event.target.value;
    if (value[value.length - 1] === 'all') {
      onRoiChange(
        Array.isArray(value)
          ? value.length - 1 === availableROIOptions.length
            ? []
            : availableROIOptions.map((entry) => Number(entry.value))
          : []
      );
      return;
    }
    onRoiChange(Array.isArray(value) ? value.map(Number) : [Number(value)]);
  };

  return (
    <Box sx={sx.container}>
      <FormControl
        sx={sx.controlWrapper}
        size="small"
      >
        <Typography sx={sx.inputLabel}>{t('dashboard.availableROILabel')}:</Typography>
        <GxMultiSelect
          value={selectedROIs.map(String)}
          onChange={handleRoiChange}
          options={availableROIOptions}
          enableSelectAll
          renderValue={(selected) => {
            if (!selected.length) {
              return `${t('dashboard.selectROILabel')}...`;
            } else if (selected.length === availableROIOptions.length) {
              return t('dashboard.allROILabel');
            } else if (selected.length < 3) {
              return selected.map((entry) => t('general.roiEntry', { index: entry })).join(', ');
            }

            return t('dashboard.multipleROISelected', { count: selected.length });
          }}
        />
      </FormControl>
    </Box>
  );
};

const sx: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1
  },
  controlWrapper: {
    flex: '0 1 350px',
    minWidth: 'min-content'
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: 600,
    marginInlineStart: '4px',
    lineHeight: '1.2',
    textWrap: 'nowrap'
  }
};
