import {
  ClickAwayListener,
  IconButton,
  MenuList,
  Paper,
  Popper,
  Tooltip,
} from "@mui/material";
import { ChannelOptionsProps } from "./ChannelOption.types";
import { useRef, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ColorPalette } from "./ColorPalette";

export const ChannelOptions = ({
  handleColorSelect,
  disabled,
}: ChannelOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <>
      <Tooltip title="Channel options" arrow>
        <IconButton
          size="small"
          onClick={() => setIsOpen((prev) => !prev)}
          ref={anchorRef}
          disabled={disabled}
          sx={sx.channelOptionsButton}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popper open={isOpen} anchorEl={anchorRef.current} placement="bottom-end">
        <Paper sx={sx.channelOptionsPaper}>
          <ClickAwayListener onClickAway={() => setIsOpen((prev) => !prev)}>
            <MenuList>
              <ColorPalette handleColorSelect={handleColorSelect} />
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
};

const sx = {
  channelOptionsPaper: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    padding: "10px",
  },
  channelOptionsButton: {
    "&:hover": {
      color: "rgba(0, 177, 164, 1)",
      backgroundColor: "unset",
    },
  },
};
