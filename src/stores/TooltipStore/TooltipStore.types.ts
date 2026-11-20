export type TooltipStore = TooltipStoreValues;

export type TooltipStoreValues = {
  position: Position;
  visible: boolean;
  type?: TooltipType;
  object?: any;
};

export type TooltipType = 'Transcript' | 'DirectSeq' | 'CellMask';

type Position = {
  x: number;
  y: number;
};
