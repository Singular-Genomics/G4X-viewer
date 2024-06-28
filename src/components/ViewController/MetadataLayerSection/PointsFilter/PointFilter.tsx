import { Box, Theme, Typography, useTheme } from "@mui/material";
import { PointFilterOptions } from "./PointFilterOptions";
import { PointFiltersTable } from "./PointFiltersTable";
import ErrorIcon from "@mui/icons-material/Error";
import { useBinaryFilesStore } from "../../../../stores/BinaryFilesStore";

export const PointFilter = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const colorMapConfig = useBinaryFilesStore((store) => store.colorMapConfig);

  return (
    <Box sx={{ ...(!colorMapConfig ? sx.disabledWrapper : {}) }}>
      {!colorMapConfig && (
        <Box sx={sx.errorContainer}>
          <ErrorIcon sx={sx.errorIcon} />
          <Typography sx={sx.errorText}>
            Missing colormap config data - filtering disabled.
          </Typography>
        </Box>
      )}
      <Box sx={{ ...(!colorMapConfig ? sx.disabledSection : {}) }}>
        <PointFilterOptions />
        <PointFiltersTable />
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  errorContainer: {
    display: "flex",
    marginBottom: "8px",
    padding: "16px",
    justifyContent: "center",
    border: "1px dashed",
    borderColor: theme.palette.gx.accent.error,
  },
  errorIcon: {
    color: theme.palette.gx.accent.error,
    marginRight: "8px",
  },
  errorText: {
    color: theme.palette.gx.accent.error,
    fontWeight: 700,
  },
  disabledWrapper: {
    cursor: "not-allowed",
  },
  disabledSection: {
    pointerEvents: "none",
    opacity: 0.5,
  },
});
