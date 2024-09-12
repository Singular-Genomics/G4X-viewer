import { Box, Theme, Tooltip, Typography, tooltipClasses } from "@mui/material";
import { PointSizeSlider } from "./PointSizeSlider";
import { ExperimentalToggles } from "./ExperimentalToggles";
import { PointFilter } from "./PointsFilter/PointFilter";
import WarningIcon from "@mui/icons-material/Warning";
import { useTranscriptLayerStore } from "../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";

const DisabledLayerWarning = () => (
  <Tooltip
    title="Transcript layer is disabled"
    placement="top"
    arrow
    slotProps={{ popper: { sx: sx.warningTooltip } }}
  >
    <WarningIcon sx={sx.warningIcon} />
  </Tooltip>
);

export const TranscriptLayerSection = () => {
  const [
    isTranscriptLayerOn,
    isGeneNameFilterActive,
    showTilesBoundries,
    showTilesData,
  ] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isTranscriptLayerOn,
      store.isGeneNameFilterActive,
      store.showTilesBoundries,
      store.showTilesData,
    ])
  );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Typography sx={sx.subsectionTitle}>Point Size</Typography>
        <PointSizeSlider />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Experimental Options</Typography>
          {!isTranscriptLayerOn && (showTilesBoundries || showTilesData) && (
            <DisabledLayerWarning />
          )}
        </Box>
        <ExperimentalToggles />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Point Filters</Typography>
          {!isTranscriptLayerOn && isGeneNameFilterActive && (
            <DisabledLayerWarning />
          )}
        </Box>
        <PointFilter />
      </Box>
    </Box>
  );
};

const sx = {
  sectionContainer: {
    overflowX: "hidden",
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
