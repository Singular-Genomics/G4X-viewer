export type CytometryGraphStore = CytometryGraphStoreValues & CytometryGraphStoreMethods;

export type CytometryGraphStoreValues = {
  proteinIndices: ProteinIndices;
  ranges?: HeatmapRanges;
  settings: HeatmapSettings;
};

export type CytometryGraphStoreMethods = {
  updateSettings: (newSettings: Partial<HeatmapSettings>) => void;
  updateProteinNames: (newNames: Partial<ProteinIndices>) => void;
  updateRanges: (newRange: HeatmapRanges) => void;
  resetFilters: () => void;
};

type HeatmapSettings = {
  binCountX: number;
  binCountY: number;
  subsamplingValue: number;
  pointSize: number;
  graphMode: GraphMode;
  axisType: AxisTypes;
  colorscale: {
    label: string;
    value: [number, string][];
    reversed: boolean;
    upperThreshold?: number;
    lowerThreshold?: number;
  };
  exponentFormat: ExponentFormat;
};

export type ProteinIndices = {
  xAxisIndex: number;
  yAxisIndex: number;
};

export type HeatmapRanges = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

export type GraphMode = 'heatmap' | 'scattergl';

export type AxisTypes = 'log' | 'linear';

export type ExponentFormat = 'none' | 'power' | 'E' | 'e' | 'SI';

export const AVAILABLE_COLORSCALES: { label: string; value: [number, string][] }[] = [
  {
    label: 'Singular',
    value: [
      [0, '#F2FCFB'],
      [0.001, '#CAF2EF'],
      [0.01, '#A2E5E0'],
      [0.03, '#79D9D2'],
      [0.05, '#51CCC4'],
      [0.1, '#28BFB5'],
      [0.2, '#00B1A5'],
      [0.3, '#00A599'],
      [0.4, '#00958A'],
      [0.5, '#008278'],
      [0.7, '#006D64'],
      [1.0, '#00534C']
    ]
  },
  {
    label: 'Viridis',
    value: [
      [0, '#440154'],
      [0.01, '#440558'],
      [0.02, '#450a5c'],
      [0.03, '#450e60'],
      [0.04, '#451465'],
      [0.05, '#461969'],
      [0.06, '#461d6d'],
      [0.07, '#462372'],
      [0.08, '#472775'],
      [0.09, '#472c7a'],
      [0.1, '#482777'],
      [0.2, '#3f4a8a'],
      [0.3, '#31678e'],
      [0.4, '#26838f'],
      [0.5, '#1f9d8a'],
      [0.6, '#6cce5a'],
      [0.7, '#b6de2b'],
      [0.8, '#fee825'],
      [1.0, '#f0f921']
    ]
  },
  {
    label: 'Plasma',
    value: [
      [0, '#0c0786'],
      [0.01, '#0d0887'],
      [0.02, '#0e0a89'],
      [0.03, '#100b8b'],
      [0.04, '#120d8d'],
      [0.05, '#140e8f'],
      [0.06, '#160f91'],
      [0.07, '#181193'],
      [0.08, '#1a1295'],
      [0.09, '#1c1497'],
      [0.1, '#40039c'],
      [0.2, '#6a00a7'],
      [0.3, '#8f0da4'],
      [0.4, '#b12a90'],
      [0.5, '#cc4778'],
      [0.6, '#e16462'],
      [0.7, '#f2844b'],
      [0.8, '#fca636'],
      [0.9, '#fcce25'],
      [1.0, '#f0f921']
    ]
  },
  {
    label: 'Inferno',
    value: [
      [0, '#000003'],
      [0.01, '#010004'],
      [0.02, '#020106'],
      [0.03, '#040208'],
      [0.04, '#05030a'],
      [0.05, '#07050c'],
      [0.06, '#09060e'],
      [0.07, '#0b0710'],
      [0.08, '#0d0812'],
      [0.09, '#0f0a15'],
      [0.1, '#1b0c41'],
      [0.2, '#4a0c6b'],
      [0.3, '#781c6d'],
      [0.4, '#a52c60'],
      [0.5, '#cf4446'],
      [0.6, '#ed6925'],
      [0.7, '#fb9b06'],
      [0.8, '#f7d13d'],
      [0.9, '#fcffa4'],
      [1.0, '#fcffa4']
    ]
  },
  {
    label: 'Magma',
    value: [
      [0, '#000003'],
      [0.01, '#010004'],
      [0.02, '#020106'],
      [0.03, '#040208'],
      [0.04, '#05030a'],
      [0.05, '#07050c'],
      [0.06, '#09060f'],
      [0.07, '#0b0711'],
      [0.08, '#0d0813'],
      [0.09, '#0f0a15'],
      [0.1, '#1c1044'],
      [0.2, '#4f127b'],
      [0.3, '#812581'],
      [0.4, '#b5367a'],
      [0.5, '#e55964'],
      [0.6, '#fb8761'],
      [0.7, '#fec287'],
      [0.8, '#fbdabb'],
      [0.9, '#f2f4f7'],
      [1.0, '#fcfdbf']
    ]
  },
  {
    label: 'Cividis',
    value: [
      [0, '#00204c'],
      [0.01, '#00214e'],
      [0.02, '#002250'],
      [0.03, '#002352'],
      [0.04, '#002454'],
      [0.05, '#002556'],
      [0.06, '#002658'],
      [0.07, '#00275a'],
      [0.08, '#00285c'],
      [0.09, '#00295e'],
      [0.1, '#003f5c'],
      [0.2, '#2c4875'],
      [0.3, '#51127c'],
      [0.4, '#73556e'],
      [0.5, '#9c6744'],
      [0.6, '#c7781c'],
      [0.7, '#ed9a00'],
      [0.8, '#ffbc0a'],
      [0.9, '#f9e784'],
      [1.0, '#ffea46']
    ]
  },
  {
    label: 'Blues',
    value: [
      [0, '#f7fbff'],
      [0.01, '#f6fafe'],
      [0.02, '#f5f9fe'],
      [0.03, '#f4f8fd'],
      [0.04, '#f3f7fc'],
      [0.05, '#f2f6fb'],
      [0.06, '#f1f5fa'],
      [0.07, '#f0f4f9'],
      [0.08, '#eff3f8'],
      [0.09, '#eef2f8'],
      [0.1, '#deebf7'],
      [0.2, '#c6dbef'],
      [0.3, '#9ecae1'],
      [0.4, '#6baed6'],
      [0.5, '#4292c6'],
      [0.6, '#2171b5'],
      [0.7, '#1361a9'],
      [0.8, '#08519c'],
      [0.9, '#08306b'],
      [1.0, '#08306b']
    ]
  },
  {
    label: 'Reds',
    value: [
      [0, '#fff5f0'],
      [0.01, '#fef4ef'],
      [0.02, '#fef3ee'],
      [0.03, '#fef2ed'],
      [0.04, '#fdf1ec'],
      [0.05, '#fdf0eb'],
      [0.06, '#fcefea'],
      [0.07, '#fceee9'],
      [0.08, '#fcedd8'],
      [0.09, '#fbece7'],
      [0.1, '#fee0d2'],
      [0.2, '#fcbba1'],
      [0.3, '#fc9272'],
      [0.4, '#fb6a4a'],
      [0.5, '#ef3b2c'],
      [0.6, '#cb181d'],
      [0.7, '#a50f15'],
      [0.8, '#99000d'],
      [0.9, '#67000d'],
      [1.0, '#67000d']
    ]
  },
  {
    label: 'Greys',
    value: [
      [0, '#ffffff'],
      [0.01, '#fefefe'],
      [0.02, '#fdfdfd'],
      [0.03, '#fcfcfc'],
      [0.04, '#fbfbfb'],
      [0.05, '#fafafa'],
      [0.06, '#f9f9f9'],
      [0.07, '#f8f8f8'],
      [0.08, '#f7f7f7'],
      [0.09, '#f6f6f6'],
      [0.1, '#f0f0f0'],
      [0.2, '#d9d9d9'],
      [0.3, '#bdbdbd'],
      [0.4, '#969696'],
      [0.5, '#737373'],
      [0.6, '#525252'],
      [0.7, '#404040'],
      [0.8, '#252525'],
      [0.9, '#1a1a1a'],
      [1.0, '#000000']
    ]
  },
  {
    label: 'RdBu',
    value: [
      [0, '#67001f'],
      [0.01, '#6d0020'],
      [0.02, '#730021'],
      [0.03, '#790022'],
      [0.04, '#7f0023'],
      [0.05, '#850024'],
      [0.06, '#8b0025'],
      [0.07, '#910026'],
      [0.08, '#970027'],
      [0.09, '#9d0028'],
      [0.1, '#b2182b'],
      [0.2, '#d6604d'],
      [0.3, '#f4a582'],
      [0.4, '#fddbc7'],
      [0.5, '#f7f7f7'],
      [0.6, '#d1e5f0'],
      [0.7, '#92c5de'],
      [0.8, '#4393c3'],
      [0.9, '#2166ac'],
      [1.0, '#053061']
    ]
  },
  {
    label: 'RdYlBu',
    value: [
      [0, '#a50026'],
      [0.01, '#a70027'],
      [0.02, '#a90028'],
      [0.03, '#ab0029'],
      [0.04, '#ad002a'],
      [0.05, '#af002b'],
      [0.06, '#b1002c'],
      [0.07, '#b3002d'],
      [0.08, '#b5002e'],
      [0.09, '#b7002f'],
      [0.1, '#d73027'],
      [0.2, '#f46d43'],
      [0.3, '#fdae61'],
      [0.4, '#fee090'],
      [0.5, '#ffffbf'],
      [0.6, '#e0f3f8'],
      [0.7, '#abd9e9'],
      [0.8, '#74add1'],
      [0.9, '#4575b4'],
      [1.0, '#313695']
    ]
  },
  {
    label: 'Spectral',
    value: [
      [0, '#9e0142'],
      [0.01, '#a00143'],
      [0.02, '#a20144'],
      [0.03, '#a40145'],
      [0.04, '#a60146'],
      [0.05, '#a80147'],
      [0.06, '#aa0148'],
      [0.07, '#ac0149'],
      [0.08, '#ae014a'],
      [0.09, '#b0014b'],
      [0.1, '#d53e4f'],
      [0.2, '#f46d43'],
      [0.3, '#fdae61'],
      [0.4, '#fee08b'],
      [0.5, '#ffffbf'],
      [0.6, '#e6f598'],
      [0.7, '#abdda4'],
      [0.8, '#66c2a5'],
      [0.9, '#3288bd'],
      [1.0, '#5e4fa2']
    ]
  },
  {
    label: 'Coolwarm',
    value: [
      [0, '#3b4cc0'],
      [0.01, '#3c4dc1'],
      [0.02, '#3d4ec2'],
      [0.03, '#3e4fc3'],
      [0.04, '#3f50c4'],
      [0.05, '#4051c5'],
      [0.06, '#4152c6'],
      [0.07, '#4253c7'],
      [0.08, '#4354c8'],
      [0.09, '#4455c9'],
      [0.1, '#5977e3'],
      [0.2, '#7b9ff9'],
      [0.3, '#9ebeff'],
      [0.4, '#c0d4f5'],
      [0.5, '#dcdcdc'],
      [0.6, '#f5c7a9'],
      [0.7, '#eeac7c'],
      [0.8, '#dc7c5a'],
      [0.9, '#c44e52'],
      [1.0, '#b40426']
    ]
  },
  {
    label: 'PiYG',
    value: [
      [0, '#8e0152'],
      [0.01, '#900153'],
      [0.02, '#920154'],
      [0.03, '#940155'],
      [0.04, '#960156'],
      [0.05, '#980157'],
      [0.06, '#9a0158'],
      [0.07, '#9c0159'],
      [0.08, '#9e015a'],
      [0.09, '#a0015b'],
      [0.1, '#c51b7d'],
      [0.2, '#de77ae'],
      [0.3, '#f1b6da'],
      [0.4, '#fde0ef'],
      [0.5, '#f7f7f7'],
      [0.6, '#e6f5d0'],
      [0.7, '#b8e186'],
      [0.8, '#7fbc41'],
      [0.9, '#4d9221'],
      [1.0, '#276419']
    ]
  }
];

export const AVAILABLE_GRAPH_MODES: GraphMode[] = ['scattergl', 'heatmap'];

export const AVAILABLE_AXIS_TYPES: AxisTypes[] = ['linear', 'log'];

export const AVAILABLE_EXPONENT_FORMATS: ExponentFormat[] = ['none', 'power', 'e', 'SI'];
