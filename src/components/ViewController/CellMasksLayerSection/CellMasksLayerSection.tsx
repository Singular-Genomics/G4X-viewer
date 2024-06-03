import { Box, Theme, Tooltip, Typography, tooltipClasses } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useCellMasksLayerStore } from "../../../stores/CellMasksLayerStore/CellMasksLayerStore";
import { useShallow } from "zustand/react/shallow";
import { CellMasksStrokeSettings } from "./CellMasksStrokeSettings/CellMasksStrokeSettings";
import { CellMasksFillSettings } from "./CellMasksFillSettings";
import { CellsFilter } from "./CellsFilter";

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
  const [isCellLayerOn, isCellFillOn, isCellStrokeOn, isCellNameFilterOn] = useCellMasksLayerStore(
    useShallow((store) => [
      store.isCellLayerOn,
      store.isCellFillOn,
      store.isCellStrokeOn,
      store.isCellNameFilterOn,
    ])
  );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Cell Stroke</Typography>
          {!isCellLayerOn && isCellStrokeOn && <DisabledLayerWarning />}
        </Box>
        <CellMasksStrokeSettings />
      </Box>
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
