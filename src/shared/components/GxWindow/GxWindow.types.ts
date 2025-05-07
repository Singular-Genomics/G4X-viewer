export type GxWindowProps = {
  title?: string;
  boundries?: Boundries;
  config?: WindowConfig;
  onClose: () => void;
};

type Boundries = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WindowConfig = {
  startWidth?: number;
  startHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};
