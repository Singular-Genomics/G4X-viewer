import { useState } from "react";
import { CollapsibleSectionProps } from "./CollapsibleSection.types";
import {
  Box,
  Button,
  Collapse,
  SxProps,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const CollapsibleSection = ({
  sectionTitle,
  children,
  defultState = "collapsed",
  unmountOnExit = true,
  customStyles,
  disabled,
}: React.PropsWithChildren<CollapsibleSectionProps>) => {
  const [expanded, setExpanded] = useState<boolean>(defultState === "open");

  const handleIconClick = () => {
    setExpanded((previousState) => !previousState);
  };

  return (
    <Box
      sx={
        {
          ...sx.sectionContainer,
          ...customStyles?.sectionContainer,
        } as SxProps
      }
    >
      <Button
        sx={
          {
            ...sx.sectionHeader,
            ...customStyles?.headerContainer,
          } as SxProps
        }
        disabled={disabled}
        onClick={handleIconClick}
      >
        <Typography sx={{ ...sx.sectionTitle, ...customStyles?.titleText }}>
          {sectionTitle}
        </Typography>
        <ExpandMoreIcon
          style={{
            transform: `rotate(${expanded ? "180deg" : "0deg"})`,
            transition: "transform 300ms ease-in-out",
          }}
          sx={sx.collapseIcon}
          fontSize="medium"
        />
      </Button>
      <Collapse in={expanded} timeout="auto" unmountOnExit={unmountOnExit}>
        <Box
          sx={
            {
              ...sx.sectionContentContainer,
              ...customStyles?.contentContainer,
            } as SxProps
          }
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

const sx = {
  sectionContainer: {
    cursor: "pointer",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    padding: '8px',
    color: "#000",
    width: "100%",
    borderRadius: 0,
    "&:after": {
      background: "#000",
      bottom: 0,
      content: '""',
      display: "block",
      height: "1px",
      left: "50%",
      position: "absolute",
      transition: "width 0.3s ease 0s, left 0.3s ease 0s",
      width: 0,
    },
    "&:hover:after": {
      width: "100%",
      left: 0,
    },
  },
  sectionTitle: {
    fontWeight: 700,
  },
  collapseIcon: {
    marginLeft: "auto",
  },
  sectionContentContainer: {
    borderBottom: "1px solid #8E9092",
    padding: "8px 0px 16px",
  },
};
