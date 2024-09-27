import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { GxCheckbox } from "../../../../../shared/components/GxCheckbox";
import { useCallback, useRef } from "react";
import { TranscriptLayerWarningModalProps } from "./TranscriptLayerWarningModal.types";

export const TranscriptLayerWarningModal = ({
  isOpen,
  onContinue,
  handleClose,
}: TranscriptLayerWarningModalProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleContinue = useCallback(() => {
    if (checkboxRef.current?.checked) {
      localStorage.setItem("disableTiledLayerWarnign_DSA", "true");
    }
    onContinue();
  }, [onContinue]);

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={sx.modalContainer}>
        <Box sx={sx.headerWrapper}>
          <WarningRoundedIcon sx={sx.warningIcon} />
          <Typography sx={sx.warnignTitle}>warning</Typography>
        </Box>
        <Box sx={sx.modalContentWrapper}>
          <Typography sx={sx.modalContentText}>
            You are about to override the number of visible transcript layers.
            <br />
            These operations demand significant computational resources and
            might cause the application to crash. Perform these operations if:
          </Typography>
          <Typography component={"span"} sx={sx.modalContentText}>
            <ul>
              <li>
                Your PC is equiped with high-end components (mainly GPU and CPU)
                and allows for hardwere acceleration.
              </li>
              <li>
                Your transcript dataset contains less than 5 million points.
              </li>
            </ul>
          </Typography>

          <Box sx={sx.modalButtonsWrapper}>
            <Button
              sx={{ ...sx.modalButtonBase, ...sx.continueButton }}
              onClick={handleContinue}
            >
              Confirm
            </Button>
            <Button
              sx={{ ...sx.modalButtonBase, ...sx.cancelButton }}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </Box>
          <hr />
          <FormControlLabel
            sx={sx.chechboxWrapper}
            label="Don't ask me again"
            control={<GxCheckbox inputRef={checkboxRef} />}
          />
        </Box>
      </Box>
    </Modal>
  );
};

const styles = (theme: Theme) => ({
  modalContainer: {
    width: "fit-content",
    position: "absolute",
    background:
      "linear-gradient(90deg, rgba(251,0,0,1) 0%, rgba(135,0,0,1) 63%, rgba(96,0,0,1) 100%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "16px",
    border: "1px solid rgba(125, 125, 125, 1)",
    overflow: "hidden",
  },
  headerWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "8px",
  },
  warningIcon: {
    height: "64px",
    width: "64px",
    color: theme.palette.gx.primary.white,
  },
  warnignTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: theme.palette.gx.primary.white,
    textTransform: "uppercase",
  },
  modalContentWrapper: {
    padding: "16px",
    background: theme.palette.gx.lightGrey[700],
  },
  modalContentText: {
    fontWeight: "bold",
  },
  modalButtonsWrapper: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    margin: "48px 0px 16px",
  },
  modalButtonBase: {
    fontWeight: "bold",
    padding: "4px 32px",
    transition: "all 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.3)",
    },
  },
  continueButton: {
    background:
      "linear-gradient(90deg, rgba(251,0,0,1) 0%, rgba(135,0,0,1) 100%)",
    color: theme.palette.gx.primary.white,
  },
  cancelButton: {
    color: theme.palette.gx.primary.black,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: theme.palette.gx.primary.black,
  },
  chechboxWrapper: {
    marginLeft: "16px",
  },
});
