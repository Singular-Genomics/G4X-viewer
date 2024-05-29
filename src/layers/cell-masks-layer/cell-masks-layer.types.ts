export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: Uint8Array;
}

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};