import {
  alpha,
  Box,
  Button,
  FormControlLabel,
  Theme,
  useTheme,
} from "@mui/material";
import { BrightfieldImageSelectorEntryProps } from "./BrightfieldImageSelectorEntry.types";
import ClearIcon from "@mui/icons-material/Clear";
import { GxRadio } from "../../../../../shared/components/GxRadio";

export const BrightfieldImageSelectorEntry = ({
  imageEntry,
  isActive,
  onSelectImage,
  onRemoveImage,
}: BrightfieldImageSelectorEntryProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  const fileName = imageEntry.name.split("/").pop();
  const imageName = fileName ? fileName.split(".").shift() : "";

  return (
    <Box sx={sx.entryContainer}>
      <FormControlLabel
        label={imageName}
        labelPlacement="end"
        control={
          <GxRadio
            value={imageEntry.name}
            checked={isActive}
            onClick={() => onSelectImage(imageEntry)}
            sx={sx.radioButton}
          />
        }
        sx={sx.entryTitle}
      />
      <Button
        onClick={() => onRemoveImage(imageEntry.name)}
        sx={sx.removeButton}
      >
        <ClearIcon sx={sx.removeIcon} />
      </Button>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  entryContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.gx.lightGrey[900],
    borderRadius: "8px",
    height: "42px",
  },
  entryTitle: {
    width: "100%",
    marginLeft: "0",
  },
  radioButton: {
    pointerEvents: "none",
    marginRight: "8px",
  },
  removeButton: {
    minWidth: "unset",
    width: "42px",
    height: "42px",
    borderRadius: "0",
    padding: "0",
    "&:hover": {
      backgroundColor: alpha(theme.palette.gx.accent.error, 0.04),
    },
  },
  removeIcon: {
    width: "100%",
    height: "100%",
    padding: "8px",
    color: theme.palette.gx.darkGrey[500],
    "&:hover": {
      color: theme.palette.gx.accent.error,
    },
  },
});
