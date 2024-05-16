import { Box, MenuItem, Typography } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore/ViewerStore";
import { COLORMAP_OPTIONS } from "../../../../shared/constants";
import { GxSelect } from "../../../../shared/components/GxSelect/GxSelect";

export const ColormapSelector = () => {

  const colormap = useViewerStore(store => store.colormap);
  const handleChange = (newValue: string) => {
    useViewerStore.setState({ colormap: newValue })
  }

  return (
    <Box>
      <GxSelect
        value={colormap}
        displayEmpty
        defaultValue=""
        onChange={(e) => handleChange(e.target.value as string)}
        fullWidth
      >
        <MenuItem 
          value=""
          disableTouchRipple
        >
          <Typography sx={sx.colormapSelectText}>None</Typography>
        </MenuItem>
        {
          COLORMAP_OPTIONS.map((option) => (
            <MenuItem
              key={option}
              value={option}
              disableTouchRipple
            >
              <Typography sx={sx.colormapSelectText}>{option}</Typography>
            </MenuItem>
          ))
        }
      </GxSelect>
    </Box>
  );
};

const sx = {
  colormapSelectText: {
    textTransform: 'capitalize',
  }
}
