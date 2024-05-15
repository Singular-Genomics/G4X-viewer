import G4XViewer from "./components/G4XViewer";
import { SnackbarProvider } from "notistack";

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
      <G4XViewer />
    </SnackbarProvider>
  );
};
