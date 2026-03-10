export const DEFAULT_OVERVIEW = {
  margin: 25,
  scale: 0.15,
  position: 'bottom-left'
};

export const DEFAULT_OVERVIEW_MOBILE = {
  ...DEFAULT_OVERVIEW,
  maximumWidth: 120,
  maximumHeight: 120
};

export const LAYER_ZOOM_OFFSET = 2;

export const COLORMAP_OPTIONS = [
  'viridis',
  'greys',
  'magma',
  'jet',
  'hot',
  'bone',
  'copper',
  'summer',
  'density',
  'inferno'
];

export const COLOR_PALLETE = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 255],
  [255, 255, 0],
  [255, 128, 0],
  [0, 255, 255],
  [255, 255, 255],
  [255, 0, 0]
];

export const FILL_PIXEL_VALUE = '----';

export const SEGMENTATION_FILE_SIZE_LIMIT = 524288000; // 500 MB
// export const TRANSCRIPT_FILEZ_SIZE_LIMIT = 1073741824; // 1 GB

// Maximum number of transcript points that can be selected in ROI to prevent browser crashes
export const MAX_TRANSCRIPT_POINTS_LIMIT = 7500000; // 7.5 million points

// Image data type max values
export const MAX_UINT16_VALUE = 65535;
export const MAX_UINT8_VALUE = 255;
