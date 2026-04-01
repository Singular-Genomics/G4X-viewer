import { Box, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useViewerStore } from '../../../stores/ViewerStore/ViewerStore';
import { GxOverflowTooltip } from '../../../shared/components/GxOverflowTooltip';

const truncateMiddle = (value: string, keepEnd: number = 2): string => {
  const maxLength = 15;
  if (value.length <= maxLength) return value;
  const start = value.slice(0, maxLength - keepEnd - 5);
  const end = value.slice(-keepEnd);
  return `${start}[...]${end}`;
};

export const NavigationRunInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const generalDetails = useViewerStore((state) => state.generalDetails);

  if (!generalDetails) return null;

  const firstSection = Object.values(generalDetails.data)[0] as Record<string, any> | undefined;
  if (!firstSection) return null;

  const { fc, sample_id, tissue_type, block, run_name } = firstSection;

  const columns = [
    { label: t('navigation.runInfo.sampleId'), value: sample_id ?? null, truncate: true, fixed: true },
    { label: t('navigation.runInfo.flowCell'), value: fc ?? null, truncate: false, fixed: true },
    { label: t('navigation.runInfo.tissueType'), value: tissue_type ?? null, truncate: false, fixed: true },
    { label: t('navigation.runInfo.block'), value: block ?? null, truncate: true, fixed: true },
    { label: t('navigation.runInfo.experiment'), value: run_name ?? null, truncate: false, fixed: false }
  ].filter((c) => c.value);

  if (columns.length === 0) return null;

  return (
    <Box sx={sx.container}>
      {columns.map(({ label, value, truncate, fixed }) => {
        const rawValue = value;
        const displayValue = truncate ? truncateMiddle(rawValue) : rawValue;
        const isTruncated = truncate && displayValue !== rawValue;

        return (
          <Box
            key={label}
            sx={{ ...sx.column, ...(fixed ? sx.fixedColumn : sx.flexColumn) }}
          >
            <Typography sx={sx.label}>{label}</Typography>
            {fixed ? (
              <Tooltip
                title={isTruncated ? rawValue : ''}
                placement="bottom"
                arrow
                enterDelay={100}
                enterNextDelay={100}
              >
                <Typography sx={sx.value}>{displayValue}</Typography>
              </Tooltip>
            ) : (
              <GxOverflowTooltip
                value={rawValue}
                sx={sx.value}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    display: 'none',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '10px',
    borderLeft: `1px solid ${alpha(theme.palette.gx.primary.white, 0.15)}`,
    paddingLeft: '20px',
    minWidth: 0,
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      gap: '12px'
    },
    [theme.breakpoints.up('lg')]: {
      gap: '16px'
    },
    [theme.breakpoints.up('xl')]: {
      gap: '24px'
    }
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  fixedColumn: {
    minWidth: '75px',
    maxWidth: '100px',
    flexShrink: 0,
    flexGrow: 1
  },
  flexColumn: {
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden'
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    color: theme.palette.gx.lightGrey[500],
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    letterSpacing: '0.04em'
  },
  value: {
    fontSize: '13px',
    fontWeight: 400,
    color: alpha(theme.palette.gx.primary.white, 0.8),
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});
