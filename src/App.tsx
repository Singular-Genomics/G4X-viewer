import { ThemeProvider } from '@mui/material';
import G4XViewer from './components/G4XViewer';
import { SnackbarProvider } from 'notistack';
import { gxTheme } from './themes/theme';
import { GxSnackbar } from './shared/components/GxSnackbar/GxSnackbar';
import { initReactI18next } from 'react-i18next';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import i18n from 'i18next';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: '/src/shared/locales/{{lng}}.json'
    },
    lng: 'en',
    fallbackLng: 'en'
  });

export const App = () => {
  return (
    <ThemeProvider theme={gxTheme}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        autoHideDuration={3000}
        maxSnack={3}
        Components={{
          gxSnackbar: GxSnackbar
        }}
      >
        <G4XViewer />
      </SnackbarProvider>
    </ThemeProvider>
  );
};
