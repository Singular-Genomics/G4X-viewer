import { Box, Tooltip, Typography, tooltipClasses } from "@mui/material";
import { PointSizeSlider } from "./PointSizeSlider";
import { ExperimentalToggles } from "./ExperimentalToggles";
import { PointFilter } from "./PointsFilter/PointFilter";
import WarningIcon from "@mui/icons-material/Warning";
import { useMetadataLayerStore } from "../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";

const DisabledLayerWarning = () => (
  <Tooltip
    title="Metadata layer is disabled"
    placement="top"
    arrow
    slotProps={{ popper: { sx: sx.warningTooltip } }}
  >
    <WarningIcon sx={sx.warningIcon} />
  </Tooltip>
);

export const MetadataLayerSection = () => {
  const [
    isMetadataLayerOn,
    isGeneNameFilterActive,
    showTilesBoundries,
    showTilesData,
  ] = useMetadataLayerStore(
    useShallow((store) => [
      store.isMetadataLayerOn,
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
          {!isMetadataLayerOn && (showTilesBoundries || showTilesData) && (
            <DisabledLayerWarning />
          )}
        </Box>
        <ExperimentalToggles />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>Point Filters</Typography>
          {!isMetadataLayerOn && isGeneNameFilterActive && (
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
    color: "#b19218",
    border: "",
  },
  warningTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
      {
        marginBottom: "0px",
      },
  },
};
