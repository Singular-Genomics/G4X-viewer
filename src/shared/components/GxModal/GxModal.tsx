import { useCallback, useMemo, useRef } from "react";
import { GxModalProps } from "./GxModal.types";
import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { GxCheckbox } from "../GxCheckbox";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import InfoIcon from "@mui/icons-material/Info";

export const GxModal = ({
  isOpen,
  onContinue,
  onClose,
  title,
  children,
  colorVariant = "singular",
  iconVariant = "info",
  dontShowFlag,
}: GxModalProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const stylesVaraint =
    colorVariants[colorVariant as keyof typeof colorVariants];

  const modalIcon = useMemo(() => {
    switch (iconVariant) {
      case "danger":
        return <WarningRoundedIcon sx={sx.modalIcon} />;
      case "warning":
        return <ReportRoundedIcon sx={sx.modalIcon} />;
      case "info":
        return <InfoIcon sx={sx.modalIcon} />;
    }
  }, [iconVariant, sx]);

  const checkboxRef = useRef<HTMLInputElement>(null);

  const handleContinue = useCallback(() => {
    if (checkboxRef.current?.checked && dontShowFlag) {
      localStorage.setItem(dontShowFlag, "true");
    }
    onContinue();
  }, [onContinue, dontShowFlag]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{ ...sx.modalContainer, ...stylesVaraint.banner }}>
        <Box sx={sx.headerWrapper}>
          {modalIcon}
          <Typography sx={sx.modalTitle}>{title}</Typography>
        </Box>
        <Box sx={sx.modalContentWrapper}>
          {children}
          <Box sx={sx.modalButtonsWrapper}>
            <Button
              sx={{
                ...sx.modalButtonBase,
                ...sx.continueButton,
                ...stylesVaraint.button,
              }}
              onClick={handleContinue}
            >
              Confirm
            </Button>
            <Button
              sx={{ ...sx.modalButtonBase, ...sx.cancelButton }}
              onClick={onClose}
            >
              Cancel
            </Button>
          </Box>

          {dontShowFlag && (
            <>
              <hr />
              <FormControlLabel
                sx={sx.chechboxWrapper}
                label="Don't ask me again"
                control={<GxCheckbox inputRef={checkboxRef} />}
              />
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

const styles = (theme: Theme) => ({
  modalContainer: {
    width: "fit-content",
    position: "absolute",
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
  modalIcon: {
    height: "64px",
    width: "64px",
    color: theme.palette.gx.primary.white,
  },
  modalTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: theme.palette.gx.primary.white,
    textTransform: "uppercase",
  },
  modalContentWrapper: {
    padding: "16px",
    background: theme.palette.gx.lightGrey[700],
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

const colorVariants = {
  danger: {
    banner: {
      background:
        "linear-gradient(90deg, rgba(251,0,0,1) 0%, rgba(135,0,0,1) 63%, rgba(96,0,0,1) 100%)",
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.danger(),
    },
  },
  warning: {
    banner: {
      background:
        "linear-gradient(90deg, rgba(251,202,0,1) 0%, rgba(245,185,0,1) 38%, rgba(177,128,0,1) 100%);",
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.warning(),
    },
  },
  info: {
    banner: {
      background:
        "linear-gradient(90deg, rgba(0,102,251,1) 0%, rgba(0,77,189,1) 63%, rgba(0,52,127,1) 100%)",
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.info(),
    },
  },
  singular: {
    banner: {
      background:
        "linear-gradient(90deg, rgba(0,177,164,1) 0%, rgba(0,151,140,1) 63%, rgba(0,95,88,1) 100%);",
    },
    button: {
      background: (theme: Theme) => theme.palette.gx.gradients.brand(),
    },
  },
};
