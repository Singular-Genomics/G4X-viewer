import { ColorScale } from 'plotly.js';

export type CytometryGraphStore = CytometryGraphStoreValues & CytometryGraphStoreMethods;

export type CytometryGraphStoreValues = {
  proteinNames: ProteinNames;
  ranges?: HeatmapRanges;
  settings: HeatmapSettings;
};

export type CytometryGraphStoreMethods = {
  updateSettings: (newSettings: Partial<HeatmapSettings>) => void;
  updateProteinNames: (newNames: Partial<ProteinNames>) => void;
  updateRanges: (newRange: HeatmapRanges) => void;
  resetFilters: () => void;
};

type HeatmapSettings = {
  binCountX: number;
  binCountY: number;
  axisType: AxisTypes;
  colorscale: {
    label: string;
    value: ColorScale;
    reversed: boolean;
  };
  exponentFormat: string;
};

export type ProteinNames = {
  xAxis?: string;
  yAxis?: string;
};

export type HeatmapRanges = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

export type AxisTypes = 'log' | 'linear';

export type ExponentFormat = 'none' | 'power' | 'E' | 'e' | 'SI';

export const AVAILABLE_COLORSCALES: { label: string; value: ColorScale }[] = [
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
  { label: 'YlGnBu', value: 'YlGnBu' },
  { label: 'YlOrRd', value: 'YlOrRd' },
  { label: 'RdBu', value: 'RdBu' },
  { label: 'Portland', value: 'Portland' },
  { label: 'Picnic', value: 'Picnic' },
  { label: 'Jet', value: 'Jet' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Greys', value: 'Greys' },
  { label: 'Greens', value: 'Greens' },
  { label: 'Electric', value: 'Electric' },
  { label: 'Earth', value: 'Earth' },
  { label: 'Bluered', value: 'Bluered' }
];

export const AVAILABLE_AXIS_TYPES: { label: string; value: AxisTypes }[] = [
  { label: 'Linear', value: 'linear' },
  { label: 'Logarythmic', value: 'log' }
];

export const AVAILABLE_EXPONENT_FORMATS: { label: string; value: ExponentFormat }[] = [
  { label: 'None', value: 'none' },
  { label: 'Power', value: 'power' },
  { label: 'Exponent (E)', value: 'E' },
  { label: 'Exponent (e)', value: 'e' },
  { label: 'International System', value: 'SI' }
];
