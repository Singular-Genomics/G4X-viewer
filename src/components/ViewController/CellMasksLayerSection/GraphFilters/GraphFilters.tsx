import { Theme, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { GxWindow } from '../../../../shared/components/GxWindow';
import { CytometryGraph } from './CytometryGraph/CytometryGraph';
import { UmapGraph } from './UmapGraph/UmapGraph';

type GraphMode = undefined | 'Cytometry' | 'Umap';

export const GraphFilters = () => {
  const theme = useTheme();
  const sx = styles(theme);

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
          value="Umap"
        >
          UMAP
        </ToggleButton>
        <ToggleButton
          sx={sx.toggleButton}
          value="Cytometry"
        >
          Cytometry
        </ToggleButton>
      </ToggleButtonGroup>
      {isWindowVisible && (
        <GxWindow
          title="test"
          onClose={() => {
            setIsWindowVisible(false);
            setSelectedGraph(undefined);
          }}
        >
          {selectedGraph === 'Cytometry' ? <CytometryGraph /> : <UmapGraph />}
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
