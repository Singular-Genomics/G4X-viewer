import { GridToolbarQuickFilter } from "@mui/x-data-grid";

export const PointFiltersSearch = () => (
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

const sx = {
  searchToolbar: {
    marginBottom: '8px',
    '& .MuiInputBase-root': {
      backgroundColor: '#FFF',
      padding: '8px',
      '&:hover:not(.Mui-disabled, .Mui-error):before': {
        borderColor: '#8E9092',
      },
      '&:after': {
        borderColor: 'rgba(0, 177, 164, 1)',
      }
    }
  },
};
