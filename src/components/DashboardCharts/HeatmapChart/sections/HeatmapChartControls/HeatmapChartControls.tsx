import { Box, FormControl, MenuItem, SelectChangeEvent, SxProps, Typography } from '@mui/material';
import { GxMultiSelect } from '../../../../../shared/components/GxMultiSelect';
import { useEffect, useMemo } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranslation } from 'react-i18next';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { HeatmapChartControlsProps, HeatmapChartValueType } from './HeatmapChartControls.types';

export const HeatmapChartControls = ({
  selectedValues,
  selectedROIs,
  selectedValueType,
  onRoiChange,
  onValuesChange,
  onValueTypeChange
}: HeatmapChartControlsProps) => {
  const { t } = useTranslation();
  const { segmentationMetadata, selectedCells } = useCellSegmentationLayerStore();

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

  const availableGenes =
    segmentationMetadata?.geneNames.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) || [];
  const availableProteins =
    segmentationMetadata?.proteinNames.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) || [];

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

  const handleValuesChange = (event: SelectChangeEvent<string[] | string>) => {
    const value = event.target.value;
    const availableOptions = selectedValueType === 'gene' ? availableGenes : availableProteins;

    if (value[value.length - 1] === 'all') {
      onValuesChange(
        Array.isArray(value) ? (value.length - 1 === availableOptions.length ? [] : availableOptions) : []
      );
      return;
    }
    onValuesChange(Array.isArray(value) ? value : [value]);
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
      <FormControl
        sx={sx.controlWrapper}
        size="small"
      >
        <Typography sx={sx.inputLabel}>{t('dashboard.boxPlotValueType')}:</Typography>
        <GxSelect
          value={selectedValueType}
          fullWidth
          sx={sx.select}
          MenuProps={{
            sx: sx.selectMenu
          }}
          onChange={(e) => {
            const newType = e.target.value as HeatmapChartValueType;
            onValueTypeChange(newType);
            onValuesChange([]);
          }}
        >
          <MenuItem value={'gene'}>{t('general.rna')}</MenuItem>
          <MenuItem value={'protein'}>{t('dashboard.protein')}</MenuItem>
        </GxSelect>
      </FormControl>
      <FormControl
        sx={sx.controlWrapper}
        size="small"
      >
        <Typography sx={sx.inputLabel}>
          {selectedValueType === 'gene' ? t('dashboard.availableGenesLabel') : t('dashboard.availableProteinsLabel')}:
        </Typography>
        <GxMultiSelect
          value={selectedValues}
          onChange={handleValuesChange}
          options={(selectedValueType === 'gene' ? availableGenes : availableProteins).map((name) => ({
            value: name,
            label: name
          }))}
          enableSelectAll
          renderValue={(selected) => {
            const availableOptions = selectedValueType === 'gene' ? availableGenes : availableProteins;
            if (!selected.length) {
              return `${t('general.selectOne')}...`;
            } else if (selected.length === availableOptions.length) {
              return t('dashboard.allROILabel');
            } else if (selected.length < 3) {
              return selected.join(', ');
            }

            return `${selected.length} selected`;
          }}
        />
      </FormControl>
    </Box>
  );
};

const sx: Record<string, SxProps> = {
  container: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1
  },
  controlWrapper: {
    flex: '1 1 150px',
    minWidth: 'min-content'
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: 600,
    marginInlineStart: '4px',
    lineHeight: '1.2',
    textWrap: 'nowrap'
  },
  selectMenu: {
    maxHeight: '500px'
  },
  select: {
    '& .MuiSelect-select': {
      fontSize: '14px',
      fontWeight: 400,
      padding: '8px 12px'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.23)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.4)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main'
    }
  }
};
