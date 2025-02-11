import { Box, IconButton, Typography, Popover } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { formatDetailsPopupData } from "./DetailsPopup.helpers";
import { DetailsPopupProps } from "./DetailsPopup.types";

export const DetailsPopup = ({ data }: DetailsPopupProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const renderDataSection = (
    sectionTitle: string,
    sectionData: Record<string, any>
  ) => (
    <>
      <Typography variant="h6" sx={sx.sectionTitle}>
        {sectionTitle}
      </Typography>
      <Box sx={sx.dataSection}>
        {formatDetailsPopupData(sectionData).map((item, index) => (
          <Box key={index} sx={sx.dataRow}>
            <Typography sx={sx.label}>{item.label}:</Typography>
            <Typography sx={sx.value}>{item.value}</Typography>
          </Box>
        ))}
      </Box>
    </>
  );

  return (
    <Box>
      <IconButton onClick={handleClick} size="small" sx={sx.infoButton}>
        <InfoIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={sx.popover}
      >
        <Box sx={sx.contentContainer}>
          <IconButton onClick={handleClose} size="small" sx={sx.closeButton}>
            <CloseIcon />
          </IconButton>
          {Object.entries(data).map(([sectionKey, sectionData]) => (
            <Box key={sectionKey}>
              {renderDataSection(
                sectionKey.split("_").join(" "),
                sectionData as Record<string, any>
              )}
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

const sx = {
  infoButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    color: "#8E9092",
    "&:hover": {
      backgroundColor: "rgba(142, 144, 146, 0.1)",
    },
  },
  closeButton: {
    position: "absolute",
    top: "8px",
    right: "8px",
    color: "#2F3032",
    "&:hover": {
      backgroundColor: "rgba(47, 48, 50, 0.1)",
    },
  },
  popover: {
    "& .MuiPopover-paper": {
      backgroundColor: "#C9CACB",
      border: "5px solid #8E9092",
      borderRadius: "10px",
    },
  },
  contentContainer: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: "400px",
    position: "relative",
  },
  sectionTitle: {
    color: "#2F3032",
    fontWeight: "700",
    marginBottom: "8px",
    textTransform: "capitalize",
    fontSize: "1.1rem",
  },
  dataSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  label: {
    color: "#2F3032",
    fontWeight: "500",
    textTransform: "capitalize",
    fontSize: "0.95rem",
  },
  value: {
    color: "#2F3032",
    fontWeight: "700",
    textAlign: "right",
    maxWidth: "300px",
    wordWrap: "break-word",
    fontSize: "0.95rem",
  },
};
