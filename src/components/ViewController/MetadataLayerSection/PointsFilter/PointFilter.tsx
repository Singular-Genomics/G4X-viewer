import { Box } from "@mui/material";
import { PointFilterOptions } from "./PointFilterOptions";
import { PointFiltersTable } from "./PointFiltersTable";

export const PointFilter = () => {
  return (
    <Box>
      <PointFilterOptions />
      <PointFiltersTable />
    </Box>
  );
};
