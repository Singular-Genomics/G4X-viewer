export type OmeroChannel = {
  label: string;
  color: string;
  active: boolean;
  window: {
    start: number;
    end: number;
    min: number;
    max: number;
  };
};

export type OmeroMetadata = {
  channels: OmeroChannel[];
  name?: string;
  rdefs?: {
    defaultT?: number;
    defaultZ?: number;
    model?: string;
  };
};

export type MultiscaleDataset = {
  path: string;
  coordinateTransformations?: unknown[];
};

export type MultiscaleAxis = {
  name: string;
  type: string;
  unit?: string;
};

export type MultiscaleMetadata = {
  version?: string;
  name?: string;
  axes?: MultiscaleAxis[];
  datasets: MultiscaleDataset[];
};
