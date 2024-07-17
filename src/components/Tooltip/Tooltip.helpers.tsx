import { Box, Typography } from "@mui/material";
import {
  CellMaskDatapointType,
  TranscriptDatapointType,
} from "./Tooltip.types";

export function TooltipTranscriptConent({
  data,
}: {
  data: TranscriptDatapointType;
}) {
  return (
    <>
      <Box sx={sx.tooltipLabelsWrapper}>
        <Typography>Position:</Typography>
        <Typography>Color:</Typography>
        <Typography>Gene Name:</Typography>
        <Typography>Cell ID:</Typography>
      </Box>
      <Box>
        <Typography sx={sx.textBold}>
          {`X: ${data.position[0].toFixed(2)} 
          Y: ${data.position[1].toFixed(2)}`}
        </Typography>
        <Typography sx={sx.textBold}>
          {`R ${data.color[0]} G ${data.color[1]} B ${data.color[2]}`}
        </Typography>
        <Typography sx={sx.textBold}>{data.geneName}</Typography>
        <Typography sx={sx.textBold}>{data.cellId}</Typography>
      </Box>
    </>
  );
}

export function TooltipCellMaskContent({
  data,
}: {
  data: CellMaskDatapointType;
}) {
  return (
    <>
      <Box sx={sx.tooltipLabelsWrapper}>
        <Typography>Cell ID:</Typography>
        <Typography>Color:</Typography>
        <Typography>Area:</Typography>
        <Typography>Total Counts:</Typography>
        <Typography>Total Genes:</Typography>
      </Box>
      <Box>
        <Typography sx={sx.textBold}>{data.cellId}</Typography>
        <Typography sx={sx.textBold}>
          {`R ${data.color[0]} G ${data.color[1]} B ${data.color[2]}`}
        </Typography>
        <Typography sx={sx.textBold}>{data.area}</Typography>
        <Typography sx={sx.textBold}>{data.totalCounts}</Typography>
        <Typography sx={sx.textBold}>{data.totalGenes}</Typography>
      </Box>
    </>
  );
}

const sx = {
  tooltipLabelsWrapper: {
    textAlign: "end",
  },
  textBold: {
    fontWeight: "700",
    textWrap: "nowrap",
  },
};
