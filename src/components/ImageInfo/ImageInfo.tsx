import { Box, Theme, Typography, alpha, useTheme } from "@mui/material";
import { useLoader } from "../../hooks/useLoader.hook";
import { useViewerStore } from "../../stores/ViewerStore";
import { useShallow } from "zustand/react/shallow";

export const ImageInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [pyramidResolution, hoverCoordinates] = useViewerStore(
    useShallow((store) => [store.pyramidResolution, store.hoverCoordinates])
  );
  const loader = useLoader();
  const level = loader[pyramidResolution];

  return (
    <>
      {level && (
        <Box sx={sx.footerWrapper}>
          <Typography sx={sx.footerText}>
            {`Mouse Pos: [${hoverCoordinates.x || "--"}, ${
              hoverCoordinates.y || "--"
            }]`}
          </Typography>
          <Typography sx={sx.footerText}>
            {`Layer: ${pyramidResolution + 1}/${loader.length}`}
          </Typography>
          <Typography sx={sx.footerText}>
            {`Shape: ${level.shape.join(", ")}`}
          </Typography>
        </Box>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  footerWrapper: {
    position: "absolute",
    right: 0,
    bottom: 0,
    display: "flex",
    gap: "8px",
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    padding: "8px 20px 10px",
    borderTopLeftRadius: "16px",
  },
  footerText: {
    color: theme.palette.gx.primary.white,
  },
});
