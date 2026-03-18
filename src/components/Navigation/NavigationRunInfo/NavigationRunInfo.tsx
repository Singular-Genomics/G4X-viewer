import { Box, Theme, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useViewerStore } from '../../../stores/ViewerStore/ViewerStore';

export const NavigationRunInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const generalDetails = useViewerStore((state) => state.generalDetails);

  if (!generalDetails) return null;

  const firstSection = Object.values(generalDetails.data)[0] as Record<string, any> | undefined;
  if (!firstSection) return null;

  const { fc, sample_id, tissue_type, block, run_name } = firstSection;

  const sampleParts = [fc, sample_id, tissue_type, block].filter(Boolean);
  const sampleValue = sampleParts.join(' | ');
  const experimentValue = run_name ?? null;

  if (!sampleValue && !experimentValue) return null;

  const rows = [
    { label: 'Sample', value: sampleValue },
    { label: 'Experiment', value: experimentValue }
  ].filter((r) => r.value);

  return (
    <Box sx={sx.container}>
      {rows.map(({ label, value }) => (
        <Box
          key={label}
          sx={sx.row}
        >
          <Typography sx={sx.label}>{label}:</Typography>
          <Typography sx={sx.value}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    display: 'none',
    flexDirection: 'column',
    gap: '2px',
    borderLeft: `1px solid ${alpha(theme.palette.gx.primary.white, 0.15)}`,
    paddingLeft: '20px',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: theme.palette.gx.lightGrey[500],
    lineHeight: 1.3,
    whiteSpace: 'nowrap'
  },
  value: {
    fontSize: '13px',
    fontWeight: 400,
    color: theme.palette.gx.primary.white,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '320px'
  }
});
