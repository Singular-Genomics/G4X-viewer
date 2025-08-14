import { Box, IconButton, Theme, alpha, useTheme } from '@mui/material';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import CreateIcon from '@mui/icons-material/Create';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DrawPolygonMode, ModifyMode } from '@deck.gl-community/editable-layers';
import MuiTooltip from '@mui/material/Tooltip';
import { PolygonDrawingMenuProps } from './PolygonDrawingMenu.types';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonImportExport } from '../PolygonImportExport';
import { useEffect, useState, useCallback } from 'react';
import { GxModal } from '../../shared/components/GxModal';

export const PolygonDrawingMenu = ({ takeScreenshot }: PolygonDrawingMenuProps) => {
  const [
    isPolygonDrawingEnabled,
    togglePolygonDrawing,
    setDrawPolygonMode,
    setModifyMode,
    setViewMode,
    setDeleteMode,
    mode,
    isViewMode,
    isDeleteMode,
    clearPolygons,
    exportPolygonsWithCells,
    exportPolygonsWithTranscripts,
    importPolygons,
    polygonFeatures
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.isPolygonDrawingEnabled,
      store.togglePolygonDrawing,
      store.setDrawPolygonMode,
      store.setModifyMode,
      store.setViewMode,
      store.setDeleteMode,
      store.mode,
      store.isViewMode,
      store.isDeleteMode,
      store.clearPolygons,
      store.exportPolygonsWithCells,
      store.exportPolygonsWithTranscripts,
      store.importPolygons,
      store.polygonFeatures
    ])
  );

  const transcriptFiles = useBinaryFilesStore((store) => store.files);
  const cellMasksData = useCellSegmentationLayerStore((store) => store.cellMasksData);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const theme = useTheme();
  const sx = styles(theme);

  // Check if any data is loaded
  const hasTranscriptData = transcriptFiles.length > 0;
  const hasCellMaskData = cellMasksData && cellMasksData.length > 0;
  const hasAnyData = hasTranscriptData || hasCellMaskData;

  const handleClearPolygons = useCallback(() => {
    if (polygonFeatures.length > 1) {
      setIsConfirmModalOpen(true);
    } else {
      clearPolygons();
    }
  }, [polygonFeatures.length, clearPolygons]);

  const handleConfirmClearPolygons = () => {
    clearPolygons();
    setIsConfirmModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsConfirmModalOpen(false);
  };

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      // Don't trigger if any modifier keys are pressed (except for Escape)
      if (event.key !== 'Escape' && (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'd': // Drawing
          if (hasAnyData) {
            event.preventDefault();
            if (!isPolygonDrawingEnabled) {
              togglePolygonDrawing();
            } else {
              setDrawPolygonMode();
            }
          }
          break;
        case 'e': // Edit
          if (hasAnyData && isPolygonDrawingEnabled) {
            event.preventDefault();
            setModifyMode();
          }
          break;
        case 'v': // View
          if (hasAnyData && isPolygonDrawingEnabled) {
            event.preventDefault();
            setViewMode();
          }
          break;
        case 'x': // Clear
          if (hasAnyData && isPolygonDrawingEnabled) {
            event.preventDefault();
            handleClearPolygons();
          }
          break;
        case 'r': // Delete mode
          if (hasAnyData && isPolygonDrawingEnabled) {
            event.preventDefault();
            setDeleteMode();
          }
          break;
        case 's': // Screenshot
          event.preventDefault();
          takeScreenshot();
          break;
        case 'escape':
          if (isPolygonDrawingEnabled) {
            event.preventDefault();
            togglePolygonDrawing();
          }
          break;
      }
    },
    [
      hasAnyData,
      isPolygonDrawingEnabled,
      togglePolygonDrawing,
      setDrawPolygonMode,
      setModifyMode,
      setViewMode,
      setDeleteMode,
      handleClearPolygons,
      takeScreenshot
    ]
  );

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // If no data is loaded, show only screenshot button
  if (!hasAnyData) {
    return (
      <Box sx={sx.menuContainer}>
        <MuiTooltip
          title="Screenshot (S)"
          placement="left"
        >
          <IconButton
            sx={sx.controlButton}
            onClick={takeScreenshot}
            color="primary"
          >
            <PhotoCameraIcon />
          </IconButton>
        </MuiTooltip>
      </Box>
    );
  }

  return (
    <Box sx={sx.menuContainer}>
      <MuiTooltip
        title="Screenshot (S)"
        placement="left"
      >
        <IconButton
          sx={sx.controlButton}
          onClick={takeScreenshot}
          color="primary"
        >
          <PhotoCameraIcon />
        </IconButton>
      </MuiTooltip>

      <PolygonImportExport
        exportPolygonsWithCells={exportPolygonsWithCells}
        exportPolygonsWithTranscripts={exportPolygonsWithTranscripts}
        importPolygons={importPolygons}
        polygonFeatures={polygonFeatures}
      />

      {!isPolygonDrawingEnabled && (
        <MuiTooltip
          title="Enable Drawing (D)"
          placement="left"
        >
          <IconButton
            sx={sx.controlButton}
            onClick={togglePolygonDrawing}
            color="primary"
          >
            <CreateIcon />
          </IconButton>
        </MuiTooltip>
      )}

      {isPolygonDrawingEnabled && (
        <Box sx={sx.expandedMenu}>
          <MuiTooltip
            title="Draw Polygon (D)"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor:
                  mode instanceof DrawPolygonMode
                    ? alpha(theme.palette.gx.accent.greenBlue, 0.5)
                    : alpha(theme.palette.gx.primary.black, 0.5)
              }}
              onClick={setDrawPolygonMode}
              color="primary"
            >
              <CreateIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title="Modify Polygon (E)"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor:
                  mode instanceof ModifyMode && !isViewMode
                    ? alpha(theme.palette.gx.accent.greenBlue, 0.5)
                    : alpha(theme.palette.gx.primary.black, 0.5)
              }}
              onClick={setModifyMode}
              color="primary"
            >
              <BorderColorIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title="View Mode (V)"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor: isViewMode
                  ? alpha(theme.palette.gx.accent.greenBlue, 0.5)
                  : alpha(theme.palette.gx.primary.black, 0.5)
              }}
              onClick={setViewMode}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title="Delete Polygon (R)"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor: isDeleteMode
                  ? alpha(theme.palette.gx.accent.greenBlue, 0.5)
                  : alpha(theme.palette.gx.primary.black, 0.5)
              }}
              onClick={setDeleteMode}
              color="primary"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title="Clear All Polygons (X)"
            placement="left"
          >
            <IconButton
              sx={sx.controlButton}
              onClick={handleClearPolygons}
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title="Disable Drawing (Esc)"
            placement="left"
          >
            <IconButton
              sx={sx.controlButton}
              onClick={togglePolygonDrawing}
              color="primary"
            >
              <CloseIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
      )}

      <GxModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModal}
        onContinue={handleConfirmClearPolygons}
        title="Remove All Polygons"
        colorVariant="danger"
        iconVariant="danger"
        size="small"
      >
        Are you sure you want to remove all {polygonFeatures.length} polygons? This action cannot be undone.
      </GxModal>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  menuContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  expandedMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  controlButton: {
    color: theme.palette.gx.lightGrey[300],
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[700], 0.5)
    },
    '&.Mui-disabled': {
      color: theme.palette.gx.darkGrey[500],
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.3)
    }
  }
});
