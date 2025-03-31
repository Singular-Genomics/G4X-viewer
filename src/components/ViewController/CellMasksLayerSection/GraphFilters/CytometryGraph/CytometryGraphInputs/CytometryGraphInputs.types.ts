export type InputRange = {
  xStart: string;
  xEnd: string;
  yStart: string;
  yEnd: string;
};

export type InputErrors = {
  xStart?: string;
  xEnd?: string;
  yStart?: string;
  yEnd?: string;
};

export type InputFieldType = "xStart" | "xEnd" | "yStart" | "yEnd";
