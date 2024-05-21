import { Box } from "@mui/material";
import { PointFilterOptions } from "./PointFilterOptions";
import { PointFiltersTable } from "./PointFiltersTable";

export const PointFilter = () => (
  <Box>
    <PointFilterOptions />
    <PointFiltersTable />
  </Box>
);
