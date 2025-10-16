import { Box, FormControl, MenuItem, SelectChangeEvent, SxProps, Typography } from '@mui/material';
import { GxMultiSelect } from '../../../../shared/components/GxMultiSelect';
import { useEffect, useMemo } from 'react';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranslation } from 'react-i18next';
import { GxSelect } from '../../../../shared/components/GxSelect';
import { BoxGraphControlsProps, BoxGraphValueType, BoxGraphHueValueOptions } from './BoxGraphControls.types';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';

const AVAILABLE_HUE_OPTIONS: BoxGraphHueValueOptions[] = ['none', 'clusterId', 'roi'];

export const BoxGraphControls = ({
  selectedValue,
  selectedROIs,
  selectedHue,
  selectedValueType,
  onRoiChange,
  onValueChange,
  onHueChange,
  onValueTypeChange
}: BoxGraphControlsProps) => {
  const { t } = useTranslation();
  const { polygonFeatures } = usePolygonDrawingStore();
  const { segmentationMetadata } = useCellSegmentationLayerStore();

  const availableROIOptions = useMemo(
    () =>
      polygonFeatures
        .map((feature) => {
          const polygonId = feature.properties?.polygonId;
          if (polygonId === undefined) return null;
          return {
            value: String(polygonId),
            label: t('general.roiEntry', { index: polygonId })
          };
        })
        .filter((entry) => !!entry),
    [t, polygonFeatures]
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
            } else if (selected.length < 4) {
              return selected.map((entry) => t('general.roiEntry', { index: entry })).join(', ');
            } else if (selected.length === availableROIOptions.length) {
              return t('dashboard.allROILabel');
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
          MenuProps={{
            sx: {
              maxHeight: '500px'
            }
          }}
          onChange={(e) => {
            const newType = e.target.value as BoxGraphValueType;
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
          <MenuItem value={'gene'}>Gene</MenuItem>
          <MenuItem value={'protein'}>Protein</MenuItem>
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
          MenuProps={{
            sx: {
              maxHeight: '500px'
            }
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
            <MenuItem value={geneName}>{geneName}</MenuItem>
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
          onChange={(e) => onHueChange(e.target.value as BoxGraphHueValueOptions)}
        >
          {AVAILABLE_HUE_OPTIONS.map((hueEntry) => (
            <MenuItem value={hueEntry}>{hueEntry.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</MenuItem>
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
  }
};
