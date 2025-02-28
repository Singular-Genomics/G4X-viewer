import { ThemeProvider } from "@mui/material";
import G4XViewer from "./components/G4XViewer";
import { SnackbarProvider } from "notistack";
import { gxTheme } from "./themes/theme";
import { GxSnackbar } from "./shared/components/GxSnackbar/GxSnackbar";

export const App = () => {
  return (
    <ThemeProvider theme={gxTheme}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        autoHideDuration={3000}
        maxSnack={3}
        Components={{
          gxSnackbar: GxSnackbar,
        }}
      >
        <G4XViewer />
      </SnackbarProvider>
    </ThemeProvider>
  );
};
