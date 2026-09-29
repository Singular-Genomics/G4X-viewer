import { Box, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { GxSwitch } from '../GxSwitch';

export const GxThemeModeToggle = () => {
  const { t } = useTranslation();
  const { colorScheme, setMode } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Box
      component="label"
      sx={sx.wrapper}
    >
      <Typography sx={{ ...sx.modeText, ...(!isDarkMode ? sx.activeModeText : {}) }}>
        {t('viewSettings.lightMode')}
      </Typography>
      <GxSwitch
        checked={isDarkMode}
        onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
        slotProps={{ input: { 'aria-label': t('viewSettings.appearance') } }}
      />
      <Typography sx={{ ...sx.modeText, ...(isDarkMode ? sx.activeModeText : {}) }}>
        {t('viewSettings.darkMode')}
      </Typography>
    </Box>
  );
};

const sx = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: 'fit-content',
    cursor: 'pointer'
  },
  modeText: {
    color: 'text.secondary',
    fontSize: '1rem',
    fontWeight: 400,
    transition: 'color 150ms ease'
  },
  activeModeText: {
    color: 'text.primary'
  }
};
