import {
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import { UploadSelectSwitchProps } from "./UploadSelectSwitch.types";
import React from "react";

export function UploadSelectSwitch({
  uploadMode,
  onUploadModeChange,
}: UploadSelectSwitchProps) {
  const theme = useTheme();
  const sx = styles(theme);

  const handleChange = (_: React.MouseEvent<HTMLElement>, value: any) => {
    if (!!value && value !== uploadMode) {
      onUploadModeChange(value);
    }
  };

  return (
    <ToggleButtonGroup
      sx={sx.toggleButtonGroup}
      exclusive
      fullWidth
      value={uploadMode}
      onChange={handleChange}
    >
      <ToggleButton sx={sx.toggleButton} value={"multi-file"}>
        <UploadIcon />
        <Typography sx={sx.toggleButtonLabel}>Multi-file</Typography>
      </ToggleButton>
      <ToggleButton sx={sx.toggleButton} value={"single-file"}>
        <UploadFileIcon />
        <Typography sx={sx.toggleButtonLabel}>Single-file</Typography>
      </ToggleButton>
      <ToggleButton sx={sx.toggleButton} value={"dir-upload"}>
        <DriveFolderUploadIcon />
        <Typography sx={sx.toggleButtonLabel}>Folder</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

const styles = (theme: Theme) => ({
  toggleButtonGroup: {},
  toggleButton: {
    width: "100%",
    display: "flex",
    gap: "8px",
    "&.Mui-selected": {
      background: theme.palette.gx.gradients.brand,
      color: theme.palette.gx.primary.white,
    },
  },
  toggleButtonLabel: {
    fontSize: "11px",
    textWrap: "nowrap",
  },
});
