import { Box, IconButton, Theme, alpha, useTheme } from '@mui/material';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import CreateIcon from '@mui/icons-material/Create';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';
import { DrawPolygonMode, ModifyMode, ViewMode } from '@deck.gl-community/editable-layers';
import MuiTooltip from '@mui/material/Tooltip';

interface PolygonDrawingMenuProps {
  takeScreenshot: () => void;
}

export const PolygonDrawingMenu = ({ takeScreenshot }: PolygonDrawingMenuProps) => {
  const [
    isPolygonDrawingEnabled,
    togglePolygonDrawing,
    setDrawPolygonMode,
    setModifyMode,
    setViewMode,
    mode,
    clearPolygons
  ] = usePolygonDrawingStore(
    useShallow((store) => [
      store.isPolygonDrawingEnabled,
      store.togglePolygonDrawing,
      store.setDrawPolygonMode,
      store.setModifyMode,
      store.setViewMode,
      store.mode,
      store.clearPolygons
    ])
  );

  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Box sx={sx.menuContainer}>
      <MuiTooltip
        title="Screenshot"
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

      {!isPolygonDrawingEnabled && (
        <MuiTooltip
          title="Enable Drawing"
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
        <>
          <MuiTooltip
            title="Draw Polygon"
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
            title="Modify Polygon"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor:
                  mode instanceof ModifyMode
                    ? alpha(theme.palette.gx.accent.greenBlue, 0.5)
                    : alpha(theme.palette.gx.primary.black, 0.5)
              }}
              onClick={setModifyMode}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </MuiTooltip>

          <MuiTooltip
            title="View Mode"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor:
                  mode instanceof ViewMode
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
            title="Clear All Polygons"
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
            title="Disable Drawing"
            placement="left"
          >
            <IconButton
              sx={{
                ...sx.controlButton,
                backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.5)
              }}
              onClick={togglePolygonDrawing}
              color="primary"
            >
              <CancelIcon />
            </IconButton>
          </MuiTooltip>
        </>
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
  controlButton: {
    color: theme.palette.gx.lightGrey[300],
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[700], 0.5)
    }
  }
});
