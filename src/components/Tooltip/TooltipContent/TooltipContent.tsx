import { Box, Typography } from '@mui/material';
import { TooltipContentProps } from './TooltipContent.types';

export function TooltipContent({ data }: TooltipContentProps) {
  return (
    <>
      <Box sx={sx.tooltipLabelsWrapper}>
        {data.map((item, index) => (
          <Typography
            sx={sx.labelText}
            key={`${item.label}_${index}`}
          >
            {item.label} :
          </Typography>
        ))}
      </Box>
      <Box>
        {data.map((item, index) => (
          <Typography
            sx={sx.valueText}
            key={`${item.label}_${index}`}
          >
            {item.value}
          </Typography>
        ))}
      </Box>
    </>
  );
}

const sx = {
  tooltipLabelsWrapper: {
    textAlign: 'end'
  },
  labelText: {
    textTransform: 'capitalize'
  },
  valueText: {
    fontWeight: '700',
    textWrap: 'nowrap'
  }
};
