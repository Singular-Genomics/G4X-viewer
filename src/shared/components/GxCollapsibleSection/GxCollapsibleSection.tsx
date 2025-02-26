import { useCallback, useEffect, useRef, useState } from "react";
import { GxCollapsibleSectionProps } from "./GxCollapsibleSection.types";
import {
  Box,
  Button,
  Collapse,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const GxCollapsibleSection = ({
  sectionTitle,
  children,
  defultState = "collapsed",
  unmountOnExit = true,
  customStyles,
  disabled,
}: React.PropsWithChildren<GxCollapsibleSectionProps>) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<boolean>(defultState === "open");

  useEffect(() => {
    if (disabled && expanded) {
      setExpanded(false);
    }
  }, [disabled, expanded]);

  const handleIconClick = useCallback(() => {
    setExpanded((previousState) => !previousState);
  }, []);

  const handleExpandScroll = useCallback(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, []);

  return (
    <Box
      sx={
        {
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
        <Typography sx={{ ...sx.sectionTitle, ...customStyles?.titleText } as any}>
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
      <Collapse
        onEntered={handleExpandScroll}
        in={expanded}
        ref={sectionRef}
        timeout="auto"
        unmountOnExit={unmountOnExit}
      >
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
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    padding: "8px",
    color: (theme: Theme) => theme.palette.gx.primary.black,
    width: "100%",
    borderRadius: 0,
    "&:after": {
      background: (theme: Theme) => theme.palette.gx.primary.black,
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
    textWrap: "nowrap",
  },
  collapseIcon: {
    marginLeft: "auto",
  },
  sectionContentContainer: {
    borderBottom: "1px solid",
    borderColor: (theme: Theme) => theme.palette.gx.mediumGrey[300],
    padding: "8px 0px 16px",
  },
};
