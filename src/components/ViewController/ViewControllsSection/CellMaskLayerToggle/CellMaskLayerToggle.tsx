import { useShallow } from "zustand/react/shallow";
import { useCellMasksLayerStore } from "../../../../stores/CellMasksLayerStore/CellMasksLayerStore";
import { FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";

export const CellMaskLayerToggle = () => {
  const [isCellLayerOn, toggleCellLayer] = useCellMasksLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.toggleCellLayer])
  );

  return (
    <FormControlLabel
      label="Cell Masks Layer"
      control={
        <GxCheckbox
          onChange={toggleCellLayer}
          checked={isCellLayerOn}
          disableTouchRipple 
        />
      }
    />
  )
};
