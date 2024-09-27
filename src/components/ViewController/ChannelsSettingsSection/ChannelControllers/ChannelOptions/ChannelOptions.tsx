import {
  ClickAwayListener,
  IconButton,
  MenuList,
  Paper,
  Popper,
  Theme,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { ChannelOptionsProps } from "./ChannelOption.types";
import { useRef, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { ColorPalette } from "./ColorPalette";

export const ChannelOptions = ({
  handleColorSelect,
  disabled,
}: ChannelOptionsProps) => {
  const theme = useTheme();
  const sx = styles(theme);

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

const styles = (theme: Theme) => ({
  channelOptionsPaper: {
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.75),
    padding: "8px",
  },
  channelOptionsButton: {
    "&:hover": {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: "unset",
    },
  },
});
