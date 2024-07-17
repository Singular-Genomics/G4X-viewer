import { Box, Typography } from "@mui/material";
import { useTooltipStore } from "../../stores/TooltipStore";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../stores/ViewerStore";

export function Tooltip() {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, viewportHeight] = useViewerStore(
    useShallow((store) => [store.viewportWidth, store.viewportHeight])
  );

  const [{ x, y }, object] = useTooltipStore(
    useShallow((store) => [store.position, store.object, store.visible])
  );

  const tooltipElement = tooltipRef.current;

  useEffect(() => {
    if (tooltipElement) {
      if (object) {
        tooltipElement.style.display = "block";

        const tooltipWidth = tooltipElement.offsetWidth;
        const tooltipHeight = tooltipElement.offsetHeight;

        const adjustedPositionX =
          x + tooltipWidth > viewportWidth ? x - tooltipWidth : x;
        const adjustedPositionY =
          y + tooltipHeight > viewportHeight ? y - tooltipHeight : y;

        tooltipElement.style.top = `${adjustedPositionY}px`;
        tooltipElement.style.left = `${adjustedPositionX}px`;
      } else {
        tooltipElement.style.display = "none";
      }
    }
  }, [tooltipElement, x, y, object, viewportWidth, viewportHeight]);

  return (
    <Box
      ref={tooltipRef}
      sx={{
        position: "absolute",
        zIndex: 10,
        pointerEvents: "none",
        display: "none",
      }}
    >
      <Box sx={sx.tooltipContainer}>
        <Box sx={sx.tooltipLabelsWrapper}>
          <Typography>Position:</Typography>
          <Typography>Color:</Typography>
          <Typography>Gene Name:</Typography>
          <Typography>Cell ID:</Typography>
        </Box>
        <Box>
          {object && (
            <>
              <Typography sx={sx.textBold}>
                {`X: ${object.position[0].toFixed(2)} 
                Y: ${object.position[1].toFixed(2)}`}
              </Typography>
              <Typography sx={sx.textBold}>
                R {object.color[0]} G {object.color[1]} B {object.color[2]}
              </Typography>
              <Typography sx={sx.textBold}>{object.geneName}</Typography>
              <Typography sx={sx.textBold}>{object.cellId}</Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const sx = {
  tooltipContainer: {
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
    textWrap: "nowrap",
  },
};
