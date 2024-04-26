import { Box, keyframes } from '@mui/material';
import { ScLogo } from '../ScLogo';
import { ScLoaderProps } from './ScLoader.types';

export const ScLoader = function ({ version = 'dark' }: ScLoaderProps) {
  return (
    <Box sx={sx.wrapper}>
      <Box sx={sx.loader} />
      <Box sx={sx.logoWrapper}>
        <ScLogo version={version} /> 
      </Box>
    </Box>
  );
};

const loaderAnimations = keyframes`
  from {
    transform: rotate(180deg);
  }

  50% {
    transform: rotate(270deg);
  }

  to {
    transform: rotate(180deg);
  }
`;

const loaderCircleAnimations = keyframes`
  from {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 60% 100%, 60% 100%)
  }

  50% {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 60%)
  }

  to {
    clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 60% 100%, 60% 100%)
  }`;

const logoAnimations = keyframes`
  from {
  opacity: 1
  }
  
  50% {
    opacity: 0.4
  }
  
  to {
    opacity: 1
  }
`;

const sx = {
  wrapper: {
    position: 'relative',
    width: '128px',
    height: '128px',
  },
  logoWrapper: {
    inset: 0,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `${logoAnimations} 1s linear infinite`,
  },
  loader: {
    width: '128px',
    height: '128px',
    borderRadius: '50%',
    position: 'relative',
    animation: `${loaderAnimations} 2s linear infinite`,
    '&:before': {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
      border: '1px solid rgba(199, 199, 199, 1)',
    },
    '&:after': {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
      border: '1px solid rgba(0, 0, 0, 1)',
      animation: `${loaderCircleAnimations} 2s linear infinite`,
    },
  },
} as const;
