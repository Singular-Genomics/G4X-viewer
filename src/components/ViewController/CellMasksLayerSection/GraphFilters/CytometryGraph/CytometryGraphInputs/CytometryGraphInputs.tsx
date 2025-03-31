import { useCallback, useEffect, useState } from "react";
import { useCellSegmentationLayerStore } from "../../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { GxInput } from "../../../../../../shared/components/GxInput";
import { Button, Theme, useTheme } from "@mui/material";
import {
  InputErrors,
  InputFieldType,
  InputRange,
} from "./CytometryGraphInputs.types";

const INPUT_FIELDS: Array<{
  field: InputFieldType;
  label: string;
  validateValue: (
    value: number,
    filter: any
  ) => { isValid: boolean; errorMessage?: string };
  updateFilter: (value: number, filter: any) => any;
}> = [
  {
    field: "xStart",
    label: "X Start",
    validateValue: (value, filter) => ({
      isValid: value < filter.xRangeEnd,
      errorMessage: "X Start can't be greater than X End",
    }),
    updateFilter: (value, filter) => ({
      ...filter,
      xRangeStart: value,
    }),
  },
  {
    field: "xEnd",
    label: "X End",
    validateValue: (value, filter) => ({
      isValid: value > filter.xRangeStart,
      errorMessage: "X End can't be lesser than X Start",
    }),
    updateFilter: (value, filter) => ({
      ...filter,
      xRangeEnd: value,
    }),
  },
  {
    field: "yStart",
    label: "Y Start",
    validateValue: (value, filter) => ({
      isValid: value < filter.yRangeStart,
      errorMessage: "Y Start can't be greater than Y End",
    }),
    updateFilter: (value, filter) => ({
      ...filter,
      yRangeEnd: value,
    }),
  },
  {
    field: "yEnd",
    label: "Y End",
    validateValue: (value, filter) => ({
      isValid: value > filter.yRangeEnd,
      errorMessage: "Y End can't be lesser than Y Start",
    }),
    updateFilter: (value, filter) => ({
      ...filter,
      yRangeStart: value,
    }),
  },
];

export function CytometryGraphInputs() {
  const theme = useTheme();
  const sx = styles(theme);

  const { cytometryFilter } = useCellSegmentationLayerStore();
  const [rangeInput, setRangeInput] = useState<InputRange>({
    xStart: "",
    xEnd: "",
    yStart: "",
    yEnd: "",
  });
  const [errors, setErrors] = useState<InputErrors>({});

  useEffect(() => {
    if (cytometryFilter) {
      setRangeInput({
        xStart: Math.round(cytometryFilter.xRangeStart).toString(),
        xEnd: Math.round(cytometryFilter.xRangeEnd).toString(),
        yStart: Math.round(cytometryFilter.yRangeEnd).toString(),
        yEnd: Math.round(cytometryFilter.yRangeStart).toString(),
      });
      setErrors({});
    }
  }, [cytometryFilter]);

  const handleInputClear = useCallback(() => {
    setRangeInput({
      xStart: "",
      xEnd: "",
      yStart: "",
      yEnd: "",
    });
    setErrors({});
    useCellSegmentationLayerStore.setState({
      cytometryFilter: undefined,
    });
  }, []);

  const handleInputChange = useCallback(
    (newValueString: string, field: InputFieldType) => {
      setRangeInput((prev) => ({
        ...prev,
        [field]: newValueString,
      }));

      if (!cytometryFilter || !newValueString) return;

      const numValue = Number(newValueString);
      const fieldConfig = INPUT_FIELDS.find((config) => config.field === field);

      if (!fieldConfig) return;

      const { isValid, errorMessage } = fieldConfig.validateValue(
        numValue,
        cytometryFilter
      );

      if (isValid) {
        useCellSegmentationLayerStore.setState({
          cytometryFilter: fieldConfig.updateFilter(numValue, cytometryFilter),
        });

        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [field]: errorMessage,
        }));
      }
    },
    [cytometryFilter]
  );

  return (
    <>
      {INPUT_FIELDS.map(({ field, label }) => (
        <GxInput
          key={field}
          value={rangeInput[field]}
          onChange={(e) => handleInputChange(e.target.value, field)}
          label={label}
          type="number"
          size="small"
          error={!!errors[field]}
          helperText={errors[field]}
        />
      ))}
      <Button onClick={handleInputClear} fullWidth sx={sx.clearButton}>
        Clear
      </Button>
    </>
  );
}

const styles = (theme: Theme) => ({
  clearButton: {
    fontWeight: 700,
    color: theme.palette.gx.primary.white,
    background: theme.palette.gx.gradients.brand(),
  },
});
