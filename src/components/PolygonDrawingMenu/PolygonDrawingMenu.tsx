import { Box, IconButton, Theme, alpha, useTheme } from '@mui/material';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import CreateIcon from '@mui/icons-material/Create';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DrawPolygonMode, ModifyMode } from '@deck.gl-community/editable-layers';
import MuiTooltip from '@mui/material/Tooltip';
import { PolygonDrawingMenuProps } from './PolygonDrawingMenu.types';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useEffect, useCallback } from 'react';

export const PolygonDrawingMenu = ({ takeScreenshot }: PolygonDrawingMenuProps) => {
  const [
    isPolygonDrawingEnabled,
    togglePolygonDrawing,
    setDrawPolygonMode,
    setModifyMode,
    setViewMode,
    mode,
    isViewMode,
    clearPolygons
    // exportPolygons,
    // importPolygons,
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.isPolygonDrawingEnabled,
      store.togglePolygonDrawing,
      store.setDrawPolygonMode,
      store.setModifyMode,
      store.setViewMode,
      store.mode,
      store.isViewMode,
      store.clearPolygons
      // store.exportPolygons,
      // store.importPolygons,
    ])
  );

  const transcriptFiles = useBinaryFilesStore((store) => store.files);
  const cellMasksData = useCellSegmentationLayerStore((store) => store.cellMasksData);

  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const [isImporting, setIsImporting] = useState(false);

  const theme = useTheme();
  const sx = styles(theme);

  // Check if any data is loaded
  const hasTranscriptData = transcriptFiles.length > 0;
  const hasCellMaskData = cellMasksData && cellMasksData.length > 0;
  const hasAnyData = hasTranscriptData || hasCellMaskData;

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
            clearPolygons();
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
      clearPolygons,
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

  // const handleImportClick = () => {
  //   fileInputRef.current?.click();
  // };

  // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setIsImporting(true);
  //     try {
  //       await importPolygons(file);
  //     } catch (error) {
  //       console.error('Failed to import polygons:', error);
  //       alert('Failed to import polygons. Please check the file format.');
  //     } finally {
  //       setIsImporting(false);
  //     }
  //   }
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };

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
      {/* TODO: Import/Export functionality - work in progress */}
      {/* <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      /> */}

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

      {/* TODO: Export functionality - work in progress */}
      {/* <MuiTooltip
        title="Export Polygons"
        placement="left"
      >
        <IconButton
          sx={sx.controlButton}
          onClick={exportPolygons}
          color="primary"
          disabled={polygonFeatures.length === 0}
        >
          <FileDownloadIcon />
        </IconButton>
      </MuiTooltip> */}

      {/* TODO: Import functionality - work in progress */}
      {/* <MuiTooltip
        title="Import Polygons"
        placement="left"
      >
        <IconButton
          sx={sx.controlButton}
          onClick={handleImportClick}
          color="primary"
          disabled={isImporting}
        >
          <FileUploadIcon />
        </IconButton>
      </MuiTooltip> */}

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
            title="Clear All Polygons (X)"
            placement="left"
          >
            <IconButton
              sx={sx.controlButton}
              onClick={clearPolygons}
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
