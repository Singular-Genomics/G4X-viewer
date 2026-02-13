import type { ZarrPathBuilder } from './ZarrDataSet.types';

export const createZarrPaths = (baseUrl: string): ZarrPathBuilder => {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return {
    cells: {
      metadata: (field) => `${base}/cells/metadata/${field}`,
      polygons: (field) => `${base}/cells/polygons/${field}`,
      protein: (field) => `${base}/cells/protein/${field}`,
      genes: (field) => `${base}/cells/genes/${field}`,
      base: () => `${base}/cells`
    },
    images: {
      multiplex: (level) => (level !== undefined ? `${base}/images/multiplex/${level}` : `${base}/images/multiplex`),
      h_and_e: (level) => (level !== undefined ? `${base}/images/h_and_e/${level}` : `${base}/images/h_and_e`)
    },
    transcripts: {
      base: () => `${base}/transcripts`,
      tile: ({ z, y, x }) => {
        const zStr = `p${z}`;
        const yStr = `y${String(y).padStart(2, '0')}`;
        const xStr = `x${String(x).padStart(2, '0')}`;
        return `${base}/transcripts/${zStr}/${yStr}/${xStr}`;
      },
      tileField: ({ z, y, x, field }) => {
        const zStr = `p${z}`;
        const yStr = `y${String(y).padStart(2, '0')}`;
        const xStr = `x${String(x).padStart(2, '0')}`;
        return `${base}/transcripts/${zStr}/${yStr}/${xStr}/${field}`;
      }
    },
    attrs: {
      root: () => `${base}/.zattrs`,
      transcripts: () => `${base}/transcripts/.zattrs`,
      multiplexLevel: (level) => `${base}/images/multiplex/${level}/.zarray`
    },
    misc: {
      summary: () => `${base}/misc/summary.html`
    }
  };
};
