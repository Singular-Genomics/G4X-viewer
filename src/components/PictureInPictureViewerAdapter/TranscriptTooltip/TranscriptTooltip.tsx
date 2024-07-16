import { Box, Typography } from "@mui/material";
import { TranscriptDatapointType, TranscriptTooltipProps } from "./TranscriptTooltip.types";
import { useEffect, useState } from "react";

export function TranscriptTooltip({ data }: TranscriptTooltipProps) {
  const [tooltipData, setTooltipData] = useState<TranscriptDatapointType | undefined>(data);

  useEffect(() => {
    setTooltipData(data);
  }, [data]);

  return (
    <>
      {tooltipData && (
        <Box sx={sx.tooltipContainer}>
          <Box sx={sx.tooltipLabelsWrapper}>
            <Typography>Position:</Typography>
            <Typography>Color:</Typography>
            <Typography>Gene Name:</Typography>
            <Typography>Cell ID:</Typography>
          </Box>
          <Box>
            <Typography sx={sx.textBold}>
              X {tooltipData.position[0].toFixed(2)} Y {tooltipData.position[1].toFixed(2)}
            </Typography>
            <Typography sx={sx.textBold}>
              R {tooltipData.color[0]} G {tooltipData.color[1]} B {tooltipData.color[2]}
            </Typography>
            <Typography sx={sx.textBold}>{tooltipData.geneName}</Typography>
            <Typography sx={sx.textBold}>{tooltipData.cellId}</Typography>
          </Box>
        </Box>
      )}
    </>
  );
}

const sx = {
  tooltipContainer: {
    width: "325px", // We're setting fixed dimensions for seemless adjustment when on the viewport borders
    height: "125px",
    backgroundColor: "#C9CACB",
    padding: "8px 16px",
    border: "5px solid #8E9092",
    borderRadius: "10px",
    display: "flex",
    gap: "10px",
    cursor: "crosshair",
  },
  tooltipLabelsWrapper: {
    textAlign: "end",
  },
  textBold: {
    fontWeight: "700",
  },
};
