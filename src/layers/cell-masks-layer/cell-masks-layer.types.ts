export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: Uint8Array;
  showCellStroke: boolean;
  cellStrokeWidth: number;
}

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};