import { Box, FormControl, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import { GxMultiSelect, GxMultiSelectOption } from '../../../../shared/components/GxMultiSelect';
import { useEffect, useMemo, useState } from 'react';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranslation } from 'react-i18next';
import { GxSelect } from '../../../../shared/components/GxSelect';
import { HueValueOptions } from './BoxGraphControls.types';

const AVAILABLE_HUE_OPTIONS: (keyof HueValueOptions)[] = ['clusterId'];

export const BoxGraphControls = () => {
  const { t } = useTranslation();
  const { selectedCells, segmentationMetadata } = useCellSegmentationLayerStore();
  const [selectedROIs, setSelectedROIs] = useState<string[]>([]);
  const [selectedGene, setSelectedGene] = useState<string | undefined>(' ');
  const [selectedHue, setSelectedHue] = useState<keyof HueValueOptions | string>('');

  const availableROIOptions = useMemo(
    () =>
      selectedCells.map(
        (entry): GxMultiSelectOption => ({
          label: t('general.roiEntry', { index: entry.roiId }),
          value: entry.roiId.toString()
        })
      ),
    [t, selectedCells]
  );

  const availableGenes = segmentationMetadata?.geneNames || [];

  useEffect(() => {
    if (!selectedROIs) {
      setSelectedROIs(availableROIOptions.map((entry) => entry.value));
    }
    if (!selectedGene && availableGenes.length) {
      setSelectedGene(availableGenes[0]);
    }
    if (!selectedHue) {
      setSelectedHue(AVAILABLE_HUE_OPTIONS[0]);
    }
    //eslint-disable-next-line
  }, []);

  const handleRoiChange = (event: SelectChangeEvent<typeof selectedROIs>) => {
    const {
      target: { value }
    } = event;
    setSelectedROIs(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={sx.container}>
      <FormControl
        sx={sx.controlWrapper}
        size="small"
      >
        <Typography sx={sx.inputLabel}>{t('dashboard.availableROILabel')}:</Typography>
        <GxMultiSelect
          value={selectedROIs}
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
          onChange={(e) => setSelectedGene(e.target.value as string)}
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
          onChange={(e) => setSelectedHue(e.target.value as keyof HueValueOptions)}
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
