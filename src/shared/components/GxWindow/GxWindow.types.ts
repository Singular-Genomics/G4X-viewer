export type GxWindowProps = {
  title?: string;
  boundries?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onClose: () => void;
};
