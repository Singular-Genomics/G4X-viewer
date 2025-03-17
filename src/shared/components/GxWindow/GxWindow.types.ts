export type GxWindowProps = {
  title?: string;
  boundries?: Boundries;
  onClose: () => void;
  initialPosition?:
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top"
    | "bottom"
    | "left"
    | "right";
};

type Boundries = {
  x: number;
  y: number;
  width: number;
  height: number;
};
