export type GxWindowProps = {
  title?: string;
  boundries?: Boundries;
  onClose: () => void;
};

type Boundries = {
  x: number;
  y: number;
  width: number;
  height: number;
};
