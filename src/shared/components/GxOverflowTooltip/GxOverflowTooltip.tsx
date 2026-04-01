import { Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { GxOverflowTooltipProps } from './GxOverflowTooltip.types';

export const GxOverflowTooltip = ({ value, sx }: GxOverflowTooltipProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  const handleMouseEnter = () => {
    if (ref.current) {
      setOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
    }
  };

  return (
    <Tooltip
      title={overflowing ? value : ''}
      placement="bottom"
      arrow
      enterDelay={100}
      enterNextDelay={100}
    >
      <Typography
        ref={ref}
        sx={sx}
        onMouseEnter={handleMouseEnter}
      >
        {value}
      </Typography>
    </Tooltip>
  );
};
