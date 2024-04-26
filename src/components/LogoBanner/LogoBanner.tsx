import { Box, Typography } from "@mui/material";
import { ScLogo } from "../../shared/components/ScLogo";

export const LogoBanner = () => (
  <Box sx={sx.logoBannerContainer}>
    <ScLogo version="light"/>
    <Typography sx={sx.logoText}>
      Singular Connect
    </Typography>
  </Box>
)

const sx = {
  logoBannerContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: 10,
    left: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoText: {
    color: '#FFF',
    fontWeight: 700,
    fontSize: '20px',
  }
}