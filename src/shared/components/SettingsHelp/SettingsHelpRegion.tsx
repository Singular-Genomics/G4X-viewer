import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { useSettingsHelp } from './SettingsHelpContext';

export const SettingsHelpRegion = ({ children, ...props }: BoxProps) => {
  const help = useSettingsHelp();
  return (
    <Box
      {...props}
      onPointerOverCapture={(event) => help?.showForTarget(event.target)}
      onPointerOutCapture={(event) => help?.showForTarget(event.relatedTarget)}
      onFocusCapture={(event) => help?.showForTarget(event.target)}
      onBlurCapture={(event) => help?.showForTarget(event.relatedTarget)}
    >
      {children}
    </Box>
  );
};
