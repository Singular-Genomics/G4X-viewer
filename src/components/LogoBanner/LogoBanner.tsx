import { Box, Typography } from "@mui/material";
import { SgLogo } from "singular-genomics-ui";

export const LogoBanner = () => (
  <Box sx={sx.logoBannerContainer}>
    <SgLogo version="light"/>
    <Typography sx={sx.logoText}>
      Singular Connect
    </Typography>
  </Box>
)

const sx = {
  logoBannerContainer: {
    position: 'absolute',
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