import { Box, Theme, Tooltip, Typography, tooltipClasses } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useCellSegmentationLayerStore } from "../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { useShallow } from "zustand/react/shallow";
import { CellMasksFillSettings } from "./CellMasksFillSettings";
import { CellsFilter } from "./CellsFilter";
import { GraphFilters } from "./GraphFilters/GraphFilters";

const DisabledLayerWarning = () => (
  <Tooltip
    title="Cell Masks layer is disabled"
    placement="top"
    arrow
    slotProps={{ popper: { sx: sx.warningTooltip } }}
  >
    <WarningIcon sx={sx.warningIcon} />
  </Tooltip>
);

export const CellMasksLayerSection = () => {
  const [isCellLayerOn, isCellFillOn, isCellNameFilterOn] =
    useCellSegmentationLayerStore(
      useShallow((store) => [
        store.isCellLayerOn,
        store.isCellFillOn,
        store.isCellNameFilterOn,
      ])
    );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Cell Fill</Typography>
          {!isCellLayerOn && isCellFillOn && <DisabledLayerWarning />}
        </Box>
        <CellMasksFillSettings />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Cell Filters</Typography>
          {!isCellLayerOn && isCellNameFilterOn && <DisabledLayerWarning />}
        </Box>
        <CellsFilter />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Graph Filters</Typography>
          {!isCellLayerOn && isCellNameFilterOn && <DisabledLayerWarning />}
        </Box>
        <GraphFilters />
      </Box>
    </Box>
  );
};

const sx = {
  sectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  subsectionWrapper: {
    display: "flex",
    gap: "8px",
  },
  subsectionTitle: {
    fontWeight: 700,
    paddingLeft: "8px",
    marginBottom: "8px",
  },
  warningIcon: {
    color: (theme: Theme) => theme.palette.gx.accent.darkGold,
    border: "",
  },
  warningTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
      {
        marginBottom: "0px",
      },
  },
};
