import { ColorScale } from 'plotly.js';

export function GetBrandColorscale(): ColorScale {
  return [
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
  ];
}
