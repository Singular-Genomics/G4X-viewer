const OUTLINE_LIGHTEN_RATIO = 0.5;

// Point color mixed towards white
export const getOutlineColor = ([r, g, b]: number[]): [number, number, number] => [
  Math.round(r + (255 - r) * OUTLINE_LIGHTEN_RATIO),
  Math.round(g + (255 - g) * OUTLINE_LIGHTEN_RATIO),
  Math.round(b + (255 - b) * OUTLINE_LIGHTEN_RATIO)
];
