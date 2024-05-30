export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: Uint8Array;
  showCellStroke: boolean;
  showCellFill: boolean;
  cellStrokeWidth: number;
  cellFillOpacity: number;
}

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};