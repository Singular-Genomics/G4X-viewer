import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Popover,
  Switch,
  Theme,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import HexagonOutlinedIcon from '@mui/icons-material/HexagonOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';

export const MobileLayerControls = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [hasTranscriptsData, hasSegmentationData] = useZarrDataStore(
    useShallow((store) => [store.hasTranscriptsData, store.hasSegmentationData])
  );
  const [isTranscriptLayerOn, toggleTranscriptLayer] = useTranscriptLayerStore(
    useShallow((store) => [store.isTranscriptLayerOn, store.toggleTranscriptLayer])
  );
  const [isCellLayerOn, toggleCellLayer] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.toggleCellLayer])
  );

  if (!hasTranscriptsData && !hasSegmentationData) return null;

  const isOpen = Boolean(anchorEl?.isConnected);

  return (
    <>
      <Button
        aria-controls={isOpen ? 'mobile-layer-controls' : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<LayersOutlinedIcon />}
        sx={sx.layersButton}
      >
        {t('general.layers')}
      </Button>

      <Popover
        id="mobile-layer-controls"
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': t('general.layers'),
            sx: sx.popoverPaper
          }
        }}
      >
        <Typography sx={sx.title}>{t('general.layers')}</Typography>
        <Divider sx={sx.divider} />

        {hasTranscriptsData && (
          <FormControlLabel
            labelPlacement="start"
            label={
              <Box sx={sx.layerLabel}>
                <ScatterPlotIcon fontSize="small" />
                <Typography sx={sx.layerName}>{t('general.transcripts')}</Typography>
              </Box>
            }
            control={
              <Switch
                checked={isTranscriptLayerOn}
                onChange={toggleTranscriptLayer}
                size="small"
                slotProps={{ input: { 'aria-label': t('hiddenLayers.transcriptLayer') } }}
                sx={sx.switch}
              />
            }
            sx={sx.layerControl}
          />
        )}

        {hasSegmentationData && (
          <FormControlLabel
            labelPlacement="start"
            label={
              <Box sx={sx.layerLabel}>
                <HexagonOutlinedIcon fontSize="small" />
                <Typography sx={sx.layerName}>{t('general.segmentation')}</Typography>
              </Box>
            }
            control={
              <Switch
                checked={isCellLayerOn}
                onChange={toggleCellLayer}
                size="small"
                slotProps={{ input: { 'aria-label': t('hiddenLayers.segmentationLayer') } }}
                sx={sx.switch}
              />
            }
            sx={sx.layerControl}
          />
        )}
      </Popover>
    </>
  );
};

const styles = (theme: Theme) => ({
  layersButton: {
    position: 'fixed',
    top: '90px',
    right: 8,
    minWidth: 0,
    padding: '6px 12px',
    borderRadius: '18px',
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.65),
    color: theme.palette.gx.primary.white,
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.5,
    textTransform: 'none',
    backdropFilter: 'blur(8px)',
    zIndex: 20,
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.78)
    }
  },
  popoverPaper: {
    width: 230,
    marginTop: '8px',
    padding: '10px',
    borderRadius: '14px',
    border: `1px solid ${alpha(theme.palette.gx.primary.white, 0.14)}`,
    background: alpha(theme.palette.gx.darkGrey[100], 0.94),
    color: theme.palette.gx.primary.white,
    boxShadow: `0 8px 24px ${alpha(theme.palette.gx.primary.black, 0.35)}`,
    backdropFilter: 'blur(12px)'
  },
  title: {
    padding: '2px 6px 8px',
    fontSize: '12px',
    fontWeight: 700,
    color: theme.palette.gx.lightGrey[500]
  },
  divider: {
    borderColor: alpha(theme.palette.gx.primary.white, 0.12),
    marginBottom: '4px'
  },
  layerControl: {
    width: '100%',
    minHeight: 44,
    margin: 0,
    padding: '4px 2px 4px 8px',
    justifyContent: 'space-between',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.07)
    }
  },
  layerLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: theme.palette.gx.primary.white
  },
  layerName: {
    fontSize: '14px',
    fontWeight: 600
  },
  switch: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: theme.palette.gx.accent.greenBlue
    }
  }
});
