export type GxColorscaleSliderProps = {
  scaleMin: number | undefined;
  scaleMax: number | undefined;
  disabled?: boolean;
  colorscale: {
    reversed: boolean;
    value: [number, string][];
  };
  lowerThreshold: number | undefined;
  upperThreshold: number | undefined;
  onThresholdChange: (lower: number, upper: number) => void;
};
