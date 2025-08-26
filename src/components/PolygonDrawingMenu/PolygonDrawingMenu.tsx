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
import { useTranslation } from 'react-i18next';

export const PolygonDrawingMenu = ({ takeScreenshot }: PolygonDrawingMenuProps) => {
  const { t } = useTranslation();
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
    polygonFeatures,
    isDetecting
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
      store.polygonFeatures,
      store.isDetecting
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
          if (hasAnyData && !isDetecting) {
            event.preventDefault();
            if (!isPolygonDrawingEnabled) {
              togglePolygonDrawing();
            } else {
              setDrawPolygonMode();
            }
          }
          break;
        case 'e': // Edit
          if (hasAnyData && isPolygonDrawingEnabled && !isDetecting) {
            event.preventDefault();
            setModifyMode();
          }
          break;
        case 'v': // View
          if (hasAnyData && isPolygonDrawingEnabled && !isDetecting) {
            event.preventDefault();
            setViewMode();
          }
          break;
        case 'x': // Clear
          if (hasAnyData && isPolygonDrawingEnabled && !isDetecting) {
            event.preventDefault();
            handleClearPolygons();
          }
          break;
        case 'r': // Delete mode
          if (hasAnyData && isPolygonDrawingEnabled && !isDetecting) {
            event.preventDefault();
            setDeleteMode();
          }
          break;
        case 's': // Screenshot
          event.preventDefault();
          takeScreenshot();
          break;
        case 'escape':
          if (isPolygonDrawingEnabled && !isDetecting) {
            event.preventDefault();
            togglePolygonDrawing();
          }
          break;
      }
    },
    [
      hasAnyData,
      isPolygonDrawingEnabled,
      isDetecting,
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
          title={t('viewer.screenshotTooltip')}
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
        title={t('viewer.screenshotTooltip')}
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
        polygonFeatures={polygonFeatures}
        isDetecting={isDetecting}
      />

      {!isPolygonDrawingEnabled && (
        <MuiTooltip
          title={t('viewer.drawingMenuEnable')}
          placement="left"
        >
          <IconButton
            sx={sx.controlButton}
            onClick={togglePolygonDrawing}
            color="primary"
            disabled={isDetecting}
          >
            <CreateIcon />
          </IconButton>
        </MuiTooltip>
      )}

      {isPolygonDrawingEnabled && (
        <Box sx={sx.expandedMenu}>
          <MuiTooltip
            title={t('viewer.drawingMenuDraw')}
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
              disabled={isDetecting}
            >
              <CreateIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title={t('viewer.drawingMenuEdit')}
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
              disabled={isDetecting}
            >
              <BorderColorIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title={t('viewer.drawingMenuView')}
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
              disabled={isDetecting}
            >
              <VisibilityIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title={t('viewer.drawingMenuDelete')}
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
              disabled={isDetecting}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title={t('viewer.drawingMenuClear')}
            placement="left"
          >
            <IconButton
              sx={sx.controlButton}
              onClick={handleClearPolygons}
              color="primary"
              disabled={isDetecting}
            >
              <DeleteIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title={t('viewer.drawingMenuDisable')}
            placement="left"
          >
            <IconButton
              sx={sx.controlButton}
              onClick={togglePolygonDrawing}
              color="primary"
              disabled={isDetecting}
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
        title={t('viewer.clearSelectionTitle')}
        colorVariant="danger"
        iconVariant="danger"
        size="small"
      >
        {t('viewer.clearSelectionDescription', { polygonCount: polygonFeatures.length })}
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
    transition: 'color 100ms ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[700], 0.5)
    },
    '&.Mui-disabled': {
      color: theme.palette.gx.darkGrey[900],
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
      cursor: 'default'
    }
  }
});
