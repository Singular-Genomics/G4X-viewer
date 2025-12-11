import { Box, MenuItem, Select, TextField, Theme, useTheme, Typography } from '@mui/material';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxInfoBox } from '../../shared/components/GxInfoBox';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ROIDetailsPanel = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const [
    polygonFeatures,
    polygonNotes,
    setPolygonNote,
    storeSelectedROIId,
    isROIDetailsPanelExpanded,
    setROIDetailsPanelExpanded
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.polygonFeatures,
      store.polygonNotes,
      store.setPolygonNote,
      store.selectedROIId,
      store.isROIDetailsPanelExpanded,
      store.setROIDetailsPanelExpanded
    ])
  );

  const selectedPoints = useTranscriptLayerStore((store) => store.selectedPoints);
  const selectedCells = useCellSegmentationLayerStore((store) => store.selectedCells);

  const roiIds = polygonFeatures.map((feature) => feature.properties?.polygonId).filter((id) => id !== undefined);

  // Use store's selectedROIId if set (from double-click), otherwise use first ROI
  const selectedRoiId =
    storeSelectedROIId && roiIds.includes(storeSelectedROIId) ? storeSelectedROIId : (roiIds[0] ?? '');

  const transcriptCountMap = useMemo(() => {
    const map = new Map<number, number>();
    selectedPoints.forEach((selection) => {
      map.set(selection.roiId, selection.data.length);
    });
    return map;
  }, [selectedPoints]);

  const cellCountMap = useMemo(() => {
    const map = new Map<number, number>();
    selectedCells.forEach((selection) => {
      map.set(selection.roiId, selection.data.length);
    });
    return map;
  }, [selectedCells]);

  useEffect(() => {
    // Reset store's selectedROIId when ROIs change and current selection becomes invalid
    if (storeSelectedROIId !== null && roiIds.length > 0 && !roiIds.includes(storeSelectedROIId)) {
      usePolygonDrawingStore.setState({ selectedROIId: null });
    }
  }, [roiIds, storeSelectedROIId]);

  if (roiIds.length === 0) {
    return null;
  }

  const handleRoiChange = (value: number) => {
    usePolygonDrawingStore.setState({ selectedROIId: value });
  };

  const handleNoteChange = (note: string) => {
    if (selectedRoiId !== '') {
      setPolygonNote(selectedRoiId, note);
    }
  };

  const currentNote = selectedRoiId !== '' ? polygonNotes[selectedRoiId] || '' : '';

  const transcriptCount = selectedRoiId !== '' ? (transcriptCountMap.get(selectedRoiId) ?? 0) : 0;
  const cellCount = selectedRoiId !== '' ? (cellCountMap.get(selectedRoiId) ?? 0) : 0;

  return (
    <GxInfoBox
      title={t('roiDetails.title')}
      tag={roiIds.length}
      expanded={isROIDetailsPanelExpanded}
      onExpandedChange={setROIDetailsPanelExpanded}
      expandedWidth={400}
      content={
        <Box sx={sx.content}>
          <Select
            value={selectedRoiId}
            onChange={(e) => handleRoiChange(e.target.value as number)}
            size="small"
            sx={sx.select}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: theme.palette.gx.darkGrey[300],
                  '& .MuiMenuItem-root': {
                    color: theme.palette.gx.lightGrey[900],
                    fontSize: '13px',
                    '&:hover': {
                      backgroundColor: theme.palette.gx.darkGrey[500]
                    },
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.gx.darkGrey[700],
                      '&:hover': {
                        backgroundColor: theme.palette.gx.darkGrey[500]
                      }
                    }
                  }
                }
              }
            }}
          >
            {roiIds.map((id) => (
              <MenuItem
                key={id}
                value={id}
              >
                ROI {id}
              </MenuItem>
            ))}
          </Select>
          <Box sx={sx.statsContainer}>
            <Box sx={sx.statItem}>
              <Typography sx={sx.statLabel}>{t('roiDetails.transcripts')}:</Typography>
              <Typography sx={sx.statValue}>{transcriptCount.toLocaleString()}</Typography>
            </Box>
            <Box sx={sx.statItem}>
              <Typography sx={sx.statLabel}>{t('roiDetails.cells')}:</Typography>
              <Typography sx={sx.statValue}>{cellCount.toLocaleString()}</Typography>
            </Box>
          </Box>
          <TextField
            multiline
            rows={4}
            value={currentNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={t('roiDetails.addNote')}
            size="small"
            sx={sx.textField}
          />
        </Box>
      }
    />
  );
};

const styles = (theme: Theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5
  },
  select: {
    fontSize: '13px',
    color: theme.palette.gx.lightGrey[900],
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.gx.darkGrey[900]
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.gx.accent.greenBlue
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.gx.accent.greenBlue
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.gx.lightGrey[900]
    }
  },
  statsContainer: {
    display: 'flex',
    gap: 2,
    padding: '8px 12px',
    backgroundColor: theme.palette.gx.darkGrey[300],
    borderRadius: '4px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  },
  statLabel: {
    fontSize: '12px',
    color: theme.palette.gx.mediumGrey[500],
    fontWeight: 500
  },
  statValue: {
    fontSize: '13px',
    color: theme.palette.gx.lightGrey[900],
    fontWeight: 600
  },
  textField: {
    fontSize: '13px',
    '& .MuiInputBase-input': {
      fontSize: '13px',
      color: theme.palette.gx.lightGrey[900]
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.gx.darkGrey[900]
      },
      '&:hover fieldset': {
        borderColor: theme.palette.gx.accent.greenBlue
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.gx.accent.greenBlue
      }
    },
    '& .MuiInputBase-input::placeholder': {
      color: theme.palette.gx.mediumGrey[500],
      opacity: 1
    }
  }
});
