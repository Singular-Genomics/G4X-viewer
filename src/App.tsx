import { ThemeProvider } from "@mui/material";
import G4XViewer from "./components/G4XViewer";
import { SnackbarProvider } from "notistack";
import { gxTheme } from "./themes/theme";

export const App = () => {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={3000}
      maxSnack={3}
    >
      <ThemeProvider theme={gxTheme}>
        <G4XViewer />
      </ThemeProvider>
    </SnackbarProvider>
  );
};
