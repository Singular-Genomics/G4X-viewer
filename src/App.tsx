import AvivatorTs from "./components/AvivatorTs";
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
      <AvivatorTs />
    </SnackbarProvider>
  );
};
