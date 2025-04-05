import { Box, IconButton, Typography } from '@mui/material';
import { GxLogo } from '../../../shared/components/GxLogo';
import CloseIcon from '@mui/icons-material/Close';
import { ControllerHeaderProps } from './ControllerHeader.types';

export const ControllerHeader = ({ onCloseController }: ControllerHeaderProps) => {
  const app_version = process.env.APP_VERSION;

  return (
    <Box sx={sx.viewControllerHeaderContainer}>
      <GxLogo version="dark" />
      <Box sx={sx.viewControllerHeaderTextWrapper}>
        <Typography sx={sx.viewControllerHeaderTitleText}>G4X Viewer</Typography>
        <Typography sx={sx.viewControllerHeaderVersionText}>{app_version}</Typography>
      </Box>
      <IconButton
        sx={sx.viewControllerHeaderButton}
        onClick={onCloseController}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

const sx = {
  viewControllerHeaderContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px'
  },
  viewControllerHeaderTextWrapper: {
    position: 'relative'
  },
  viewControllerHeaderTitleText: {
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '20px'
  },
  viewControllerHeaderVersionText: {
    position: 'absolute',
    fontSize: '14px',
    lineHeight: '14px',
    right: 0
  },
  viewControllerHeaderButton: {
    marginLeft: 'auto'
  }
};
