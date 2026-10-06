import { Theme, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { GxWindow } from '../../../../shared/components/GxWindow';
import { CytometryGraph } from './CytometryGraph/CytometryGraph';
import { UmapGraph } from './UmapGraph/UmapGraph';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useTranslation } from 'react-i18next';

type GraphMode = undefined | 'flow_cytometry' | 'umap';

const GRAPH_WINDOW_CONFIG = {
  startWidth: 608,
  startHeight: 456,
  minWidth: 480,
  minHeight: 360,
  maxWidth: 1280,
  maxHeight: 720,
  startY: 100
};

export const GraphFilters = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const { umapDataAvailable, segmentationMetadata } = useCellSegmentationLayerStore();
  const [selectedGraph, setSelectedGraph] = useState<GraphMode>(undefined);
  const [isWindowVisible, setIsWindowVisible] = useState(false);

  const handleGraphChange = useCallback((_: React.MouseEvent, newValue: string) => {
    setSelectedGraph(newValue as GraphMode);
    setIsWindowVisible(!!newValue);
  }, []);

  return (
    <>
      <ToggleButtonGroup
        sx={sx.toggleButtonGroup}
        orientation="vertical"
        value={selectedGraph}
        exclusive
        onChange={handleGraphChange}
      >
        <ToggleButton
          sx={sx.toggleButton}
          value="umap"
          disabled={!umapDataAvailable}
        >
          {t('segmentationSettings.graphFilterUmapLabel')}
        </ToggleButton>
        <ToggleButton
          sx={sx.toggleButton}
          value="flow_cytometry"
          disabled={!segmentationMetadata?.proteinNames}
        >
          {t('segmentationSettings.graphFilterCytometryLabel')}
        </ToggleButton>
      </ToggleButtonGroup>
      {isWindowVisible && (
        <GxWindow
          title={selectedGraph?.replace('_', ' ')}
          titleTooltip={(selectedGraph === 'flow_cytometry' && t('tooltips.flowCytometry.title')) || undefined}
          config={GRAPH_WINDOW_CONFIG}
          onClose={() => {
            setIsWindowVisible(false);
            setSelectedGraph(undefined);
          }}
        >
          {selectedGraph === 'flow_cytometry' ? <CytometryGraph /> : <UmapGraph />}
        </GxWindow>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  toggleButtonGroup: {
    marginBottom: '16px',
    width: '100%'
  },
  toggleButton: {
    width: '100%',
    display: 'flex',
    fontWeight: 700,
    borderColor: theme.palette.gx.primary.black,
    color: theme.palette.gx.primary.black,
    gap: '8px',
    '&.Mui-selected.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[100]
    },
    '&.Mui-selected': {
      background: theme.palette.gx.gradients.brand(),
      color: theme.palette.gx.primary.white
    }
  },
  toggleButtonLabel: {
    fontSize: '11px',
    textWrap: 'nowrap'
  }
});
