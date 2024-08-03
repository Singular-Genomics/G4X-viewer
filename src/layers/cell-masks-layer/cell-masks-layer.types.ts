import { PickingInfo } from "@deck.gl/core/typed";

export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: Uint8Array;
  showCellStroke: boolean;
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellStrokeWidth: number;
  cellFillOpacity: number;
  cellFilters: string[] | "all";
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
