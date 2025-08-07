import { Box, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import { CytometrySettingsMenu } from './CytometrySettingsMenu';
import { GxSelect } from '../../../../../../shared/components/GxSelect';
import { CytometryHeaderProps } from './CytometryHeader.types';
import { useEffect, useState } from 'react';
import { useCytometryGraphStore } from '../../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { useTranslation } from 'react-i18next';

export const CytometryHeader = ({ availableProteinNames }: CytometryHeaderProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [xAxisProtein, setXAxisProtein] = useState('');
  const [yAxisProtein, setYAxisProtein] = useState('');

  useEffect(() => {
    if (!availableProteinNames.length) {
      return;
    }

    const { proteinNames } = useCytometryGraphStore.getState();

    if (!proteinNames.xAxis || !proteinNames.yAxis) {
      setXAxisProtein(availableProteinNames[0]);
      setYAxisProtein(availableProteinNames[1]);
      useCytometryGraphStore.setState({
        proteinNames: {
          xAxis: availableProteinNames[0],
          yAxis: availableProteinNames[1]
        }
      });
    } else {
      setXAxisProtein(proteinNames.xAxis);
      setYAxisProtein(proteinNames.yAxis);
    }
  }, [availableProteinNames]);

  const handleProteinChange = (proteinName: string, axis: 'y' | 'x') =>
    setTimeout(() => {
      useCytometryGraphStore
        .getState()
        .updateProteinNames(axis === 'x' ? { xAxis: proteinName } : { yAxis: proteinName });
    }, 10);

  return (
    <Box sx={sx.headerWrapper}>
      <Box sx={sx.selectWrapper}>
        <Typography sx={sx.selectLabel}>{`${t('segmentationSettings.cytometryGraphXAxisSource')}:`}</Typography>
        <GxSelect
          fullWidth
          value={xAxisProtein}
          onChange={(e) => {
            setXAxisProtein(e.target.value as string);
            handleProteinChange(e.target.value as string, 'x');
          }}
          MenuProps={{ sx: { zIndex: 3000 } }}
        >
          {availableProteinNames.map((proteinName) => (
            <MenuItem
              value={proteinName}
              disabled={proteinName === yAxisProtein}
            >
              {proteinName}
            </MenuItem>
          ))}
        </GxSelect>
        <Typography sx={sx.selectLabel}>{`${t('segmentationSettings.cytometryGraphYAxisSource')}:`}</Typography>
        <GxSelect
          fullWidth
          value={yAxisProtein}
          onChange={(e) => {
            setYAxisProtein(e.target.value as string);
            handleProteinChange(e.target.value as string, 'y');
          }}
          MenuProps={{ sx: { zIndex: 3000 } }}
        >
          {availableProteinNames.map((proteinName) => (
            <MenuItem
              value={proteinName}
              disabled={proteinName === xAxisProtein}
            >
              {proteinName.replace('_', ' ')}
            </MenuItem>
          ))}
        </GxSelect>
      </Box>
      <CytometrySettingsMenu />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  headerWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: 'min-content'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.palette.gx.primary.white,
    gap: '16px',
    padding: '8px'
  },
  selectLabel: {
    textAlign: 'right',
    textWrap: 'nowrap',
    fontWeight: 'bold'
  }
});
