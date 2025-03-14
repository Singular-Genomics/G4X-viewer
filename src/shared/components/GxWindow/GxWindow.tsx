import { Box, IconButton, Theme, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { GxWindowProps } from "./GxWindow.types";

export const GxWindow = ({
  children,
  title,
  boundries,
  onClose,
}: React.PropsWithChildren<GxWindowProps>) => {
  const theme = useTheme();
  const sx = styles(theme);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (divRef.current) {
        const rect = divRef.current.getBoundingClientRect();
        dragOffset.current.x = event.clientX - rect.left;
        dragOffset.current.y = event.clientY - rect.top;
        setIsDragging(true);
      }
    },
    //eslint-disable-next-line
    [divRef.current]
  );

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging || !divRef.current) return;

    const windowEl = divRef.current;
    const parentEl = windowEl.parentElement;
    let newXPos = e.clientX - dragOffset.current.x;
    let newYPos = e.clientY - dragOffset.current.y;

    const windowSize = windowEl.getBoundingClientRect();
    const windowContainer = boundries || parentEl?.getBoundingClientRect();
    if (windowContainer) {
      if (newXPos < windowContainer.x) {
        newXPos = windowContainer.x;
      } else if (newXPos + windowSize.width > windowContainer.width) {
        newXPos = windowContainer.width - windowSize.width;
      }

      if (newYPos < windowContainer.y) {
        newYPos = windowSize.y;
      } else if (newYPos + windowSize.height > windowContainer.height) {
        newYPos = windowContainer.height - windowSize.height;
      }
    }

    setPosition({
      x: newXPos,
      y: newYPos,
    });

    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    //eslint-disable-next-line
  }, [isDragging]);

  return (
    <Box
      ref={divRef}
      sx={sx.windowContainer(position.x, position.y, isDragging)}
      style={{}}
    >
      <Box sx={sx.windowHandle(isDragging)} onMouseDown={handleMouseDown} />
      <Box sx={sx.windowHeader}>
        {title && <Box sx={{ fontWeight: 700 }}>{title}</Box>}
        <IconButton
          onClick={onClose}
          disableTouchRipple
          sx={sx.iconButton}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={sx.windowContentWrapper}>{children}</Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  windowContainer: (posX: number, posY: number, isDragging: boolean) => ({
    borderRadius: "8px 8px 0px 0px",
    position: "absolute",
    backgroundColor: theme.palette.gx.mediumGrey[500],
    zIndex: 9999,
    transition: "box-shadow 0.25s",
    boxShadow: isDragging
      ? "24px 24px 8px rgba(0,0,0,0.5)"
      : "8px 8px 8px rgba(0,0,0,0.8)",
    left: `${posX}px`,
    top: `${posY}px`,
    border: "4px solid",
    BorderColor: theme.palette.gx.primary.black,
  }),
  windowHandle: (isDragging: boolean) => ({
    width: "64px",
    height: "6px",
    background: "black",
    marginInline: "auto",
    marginBlock: "2px",
    borderRadius: "3px",
    cursor: isDragging ? "grabbing" : "grab",
  }),
  windowHeader: {
    display: "flex",
    alignItems: "center",
    background: theme.palette.gx.gradients.brand(),
    paddingInline: "4px",
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: theme.palette.gx.primary.black,
  },
  windowContentWrapper: {
    backgroundColor: theme.palette.gx.lightGrey[300],
    minWidth: "200px",
    minHeight: "50px",
    resize: "both",
    overflow: "auto",
    padding: "8px",
  },
  iconButton: {
    marginLeft: "auto",
    color: theme.palette.gx.primary.black,
    backgroundColor: theme.palette.gx.mediumGrey[500],
    padding: "2px",
    marginBlock: "4px",
    "&:hover": {
      backgroundColor: theme.palette.gx.mediumGrey[100],
    },
  },
});
