import { Theme, useTheme } from "@mui/material";
import { GridToolbarQuickFilter } from "@mui/x-data-grid";

export const PointFiltersSearch = () => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <GridToolbarQuickFilter
      quickFilterParser={(searchInput: string) =>
        searchInput
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value !== "")
      }
      sx={sx.searchToolbar}
    />
  );
};

const styles = (theme: Theme) => ({
  searchToolbar: {
    marginBottom: "8px",
    "& .MuiInputBase-root": {
      backgroundColor: theme.palette.gx.primary.white,
      padding: "8px",
      "&:hover:not(.Mui-disabled, .Mui-error):before": {
        borderColor: theme.palette.gx.mediumGrey[300],
      },
      "&:after": {
        borderColor: theme.palette.gx.accent.greenBlue,
      },
    },
  },
});
