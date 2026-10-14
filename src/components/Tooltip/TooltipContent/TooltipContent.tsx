import { Box, Divider, Theme, Typography, useTheme } from '@mui/material';
import { TooltipContentProps } from './TooltipContent.types';

export function TooltipContent({ data, title }: TooltipContentProps) {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Box sx={sx.wrapper}>
      {title && (
        <>
          <Typography sx={sx.titleText}>{title}</Typography>
          <Divider sx={sx.divider} />
        </>
      )}
      <Box sx={sx.dataRow}>
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
      </Box>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  titleText: {
    fontWeight: '700',
    fontSize: 'inherit',
    textTransform: 'uppercase',
    mb: '4px'
  },
  divider: {
    borderColor: theme.palette.gx.darkGrey[900],
    mb: '6px'
  },
  dataRow: {
    display: 'flex',
    gap: '10px'
  },
  tooltipLabelsWrapper: {
    textAlign: 'end'
  },
  labelText: {
    textTransform: 'capitalize',
    fontSize: 'inherit'
  },
  valueText: {
    fontWeight: '700',
    textWrap: 'nowrap',
    fontSize: 'inherit'
  }
});
