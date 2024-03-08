import { Box, Typography } from "@mui/material";
import { useLoader } from "../../hooks/useLoader.hook";
import { useViewerStore } from "../../stores/ViewerStore";

export const ImageInfo = () => {
  const pyramidResolution = useViewerStore((store) => store.pyramidResolution);
  const loader = useLoader();
  const level = loader[pyramidResolution];

  return (
    <>
      {level && (
        <Box sx={sx.footerWrapper}>
          <Typography sx={sx.footerText}>{`Layer: ${pyramidResolution + 1}/${loader.length}`}</Typography>
          <Typography sx={sx.footerText}>{`Shape: ${level.shape.join(", ")}`}</Typography>
        </Box>
      )}
    </>
  );
};

const sx = {
  footerWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    display: 'flex',
    gap: '8px',
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: '8px 20px 10px',
    borderTopLeftRadius: '16px',
  },
  footerText: {
    color: '#FFF',
  }
}
