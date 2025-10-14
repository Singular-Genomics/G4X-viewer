import { Box, FormControl, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import { GxMultiSelect } from '../../../../shared/components/GxMultiSelect';
import { useMemo } from 'react';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranslation } from 'react-i18next';
import { GxSelect } from '../../../../shared/components/GxSelect';
import { BoxGraphControlsProps, HueValueOptions } from './BoxGraphControls.types';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';

const AVAILABLE_HUE_OPTIONS: HueValueOptions[] = ['none', 'clusterId', 'roi'];

export const BoxGraphControls = ({
  selectedGene,
  selectedROIs,
  selectedHue,
  onRoiChange,
  onGeneChange,
  onHueChange
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

  const availableGenes = segmentationMetadata?.geneNames || [];

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
        <Typography sx={sx.inputLabel}>{t('dashboard.availableGenesLabel')}:</Typography>
        <GxSelect
          value={selectedGene}
          fullWidth
          MenuProps={{
            sx: {
              maxHeight: '500px'
            }
          }}
          onChange={(e) => onGeneChange(e.target.value as string)}
        >
          <MenuItem
            value={' '}
            disabled
          >
            {t('general.selectOne')}
          </MenuItem>
          {availableGenes?.map((geneName) => (
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
          onChange={(e) => onHueChange(e.target.value as HueValueOptions)}
        >
          {AVAILABLE_HUE_OPTIONS.map((hueEntry) => (
            <MenuItem value={hueEntry}>{hueEntry.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</MenuItem>
          ))}
        </GxSelect>
      </FormControl>
    </Box>
  );
};

const sx = {
  container: {
    width: '100%',
    display: 'flex',
    gap: 1
  },
  controlWrapper: {
    width: '100%',
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
