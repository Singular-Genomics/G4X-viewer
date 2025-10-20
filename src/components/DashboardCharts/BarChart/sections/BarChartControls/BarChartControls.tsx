import { Box, FormControl, MenuItem, SelectChangeEvent, SxProps, Typography } from '@mui/material';
import { GxMultiSelect } from '../../../../../shared/components/GxMultiSelect';
import { useEffect, useMemo } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranslation } from 'react-i18next';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { BarChartControlsProps, BarChartValueType, BarChartHueValueOptions } from './BarChartControls.types';

const AVAILABLE_HUE_OPTIONS: BarChartHueValueOptions[] = ['none', 'clusterId', 'roi'];

export const BarChartControls = ({
  selectedValue,
  selectedROIs,
  selectedHue,
  selectedValueType,
  onRoiChange,
  onValueChange,
  onHueChange,
  onValueTypeChange
}: BarChartControlsProps) => {
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

  const availableGenes = segmentationMetadata?.geneNames || [];
  const availableProteins = segmentationMetadata?.proteinNames || [];

  const handleRoiChange = (event: SelectChangeEvent<string[] | string>) => {
    const {
      target: { value }
    } = event;
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
            const newType = e.target.value as BarChartValueType;
            onValueTypeChange(newType);
            onValueChange(
              newType === 'gene'
                ? availableGenes.length
                  ? availableGenes[0]
                  : ' '
                : availableProteins.length
                  ? availableProteins[0]
                  : ' '
            );
          }}
        >
          <MenuItem value={'gene'}>{t('dashboard.gene')}</MenuItem>
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
        <GxSelect
          value={selectedValue}
          fullWidth
          sx={sx.select}
          MenuProps={{
            sx: sx.selectMenu
          }}
          onChange={(e) => onValueChange(e.target.value as string)}
        >
          <MenuItem
            value={' '}
            disabled
          >
            {t('general.selectOne')}
          </MenuItem>
          {(selectedValueType === 'gene' ? availableGenes : availableProteins).map((geneName) => (
            <MenuItem
              key={geneName}
              value={geneName}
            >
              {geneName}
            </MenuItem>
          ))}
        </GxSelect>
      </FormControl>
      <FormControl
        sx={sx.controlWrapper}
        size="small"
      >
        <Typography sx={sx.inputLabel}>{t('dashboard.availableHueLabel')}:</Typography>
        <GxSelect
          value={selectedHue}
          fullWidth
          sx={sx.select}
          MenuProps={{
            sx: sx.selectMenu
          }}
          onChange={(e) => onHueChange(e.target.value as BarChartHueValueOptions)}
        >
          {AVAILABLE_HUE_OPTIONS.map((hueEntry) => (
            <MenuItem
              key={hueEntry}
              value={hueEntry}
            >
              {hueEntry.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}
            </MenuItem>
          ))}
        </GxSelect>
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
