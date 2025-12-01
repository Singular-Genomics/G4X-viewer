import { Box, MenuItem, Select, TextField, Theme, useTheme } from '@mui/material';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { GxInfoBox } from '../../shared/components/GxInfoBox';
import { useEffect } from 'react';

export const ROIDetailsPanel = () => {
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

  const roiIds = polygonFeatures.map((feature) => feature.properties?.polygonId).filter((id) => id !== undefined);

  // Use store's selectedROIId if set (from double-click), otherwise use first ROI
  const selectedRoiId =
    storeSelectedROIId && roiIds.includes(storeSelectedROIId) ? storeSelectedROIId : (roiIds[0] ?? '');

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

  return (
    <GxInfoBox
      title="ROI Details"
      tag={roiIds.length}
      expanded={isROIDetailsPanelExpanded}
      onExpandedChange={setROIDetailsPanelExpanded}
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
          <TextField
            multiline
            rows={4}
            value={currentNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Add note..."
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
