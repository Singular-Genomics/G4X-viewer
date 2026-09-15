import { Box, Theme, Typography, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { GxSwitch } from '../GxSwitch';

export const GxThemeModeToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { colorScheme, setMode } = useColorScheme();

  return (
    <Box sx={sx.wrapper}>
      <Typography sx={sx.label}>Light</Typography>
      <GxSwitch
        checked={colorScheme === 'dark'}
        onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
      />
      <Typography sx={sx.label}>Dark</Typography>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: theme.palette.text.primary
  }
});
