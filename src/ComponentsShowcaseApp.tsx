import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { initReactI18next } from 'react-i18next';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import i18n from 'i18next';
import { gxTheme } from './themes/theme';
import { GxSnackbar } from './shared/components/GxSnackbar/GxSnackbar';
import { ComponentsShowcaseView } from './views/ComponentsShowcaseView';
import { ButtonReferenceView } from './views/ButtonReferenceView/ButtonReferenceView';
import { ColorReferenceView } from './views/ColorReferenceView/ColorReferenceView';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      loadPath: '/locales/{{lng}}.json'
    },
    lng: 'en',
    fallbackLng: 'en'
  });

export const ComponentsShowcaseApp = ({
  buttonReference = false,
  colorReference = false
}: {
  buttonReference?: boolean;
  colorReference?: boolean;
}) => {
  return (
    <ThemeProvider
      theme={gxTheme}
      // Custom styles and Plotly consume resolved colors from theme.palette.
      forceThemeRerender
    >
      <CssBaseline enableColorScheme />
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
        {colorReference ? (
          <ColorReferenceView />
        ) : buttonReference ? (
          <ButtonReferenceView />
        ) : (
          <ComponentsShowcaseView />
        )}
      </SnackbarProvider>
    </ThemeProvider>
  );
};
