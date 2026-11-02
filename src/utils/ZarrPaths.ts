import type { ZarrPathBuilder, ZarrTileCoordinates, ZarrTranscriptTileFieldParams } from './ZarrDataSet.types';

const padTile = (n: number) => String(n).padStart(2, '0');
const tiledTileBase = (group: string, { z, y, x }: ZarrTileCoordinates) =>
  `${group}/p${z}/y${padTile(y)}/x${padTile(x)}`;

// /transcripts and /direct_seq share one layout
const createTiledSubpaths = (group: string) => ({
  base: group,
  tile: (params: ZarrTileCoordinates) => tiledTileBase(group, params),
  tileField: ({ z, y, x, field }: ZarrTranscriptTileFieldParams) => `${tiledTileBase(group, { z, y, x })}/${field}`
});

export const ZARR_SUBPATHS = {
  attrs: {
    root: '.zattrs',
    group: '.zgroup',
    transcripts: 'transcripts/.zattrs',
    directSeq: 'direct_seq/.zattrs',
    images: 'images/.zattrs',
    cells: 'cells/.zattrs',
    cellsSegmentation: (folder: string) => `cells/${folder}/.zattrs`,
    multiplexLevel: (level: number) => `images/multiplex/${level}/.zarray`
  },
  cells: {
    base: 'cells',
    segmentation: (folder: string) => `cells/${folder}`,
    field: (folder: string, field: string) => `cells/${folder}/${field}`
  },
  images: {
    base: 'images',
    multiplex: (level?: number) => (level !== undefined ? `images/multiplex/${level}` : 'images/multiplex'),
    h_and_e: (level?: number) => (level !== undefined ? `images/h_and_e/${level}` : 'images/h_and_e')
  },
  transcripts: createTiledSubpaths('transcripts'),
  directSeq: createTiledSubpaths('direct_seq'),
  misc: {
    summary: 'misc/summary.html'
  }
} as const;

export const ZARR_CELL_FIELDS = {
  cellId: 'cell_id',
  area: 'area',
  clusterId: 'cluster_id',
  polygonOffsets: 'polygon_offsets',
  polygonVerticesXy: 'polygon_vertices_xy',
  proteinValues: 'protein_values',
  totalCounts: 'total_counts',
  totalGenes: 'total_genes',
  umap: 'umap',
  position: 'position', // cell centroid
  proteinNames: 'protein_names',
  geneNames: 'gene_names',
  geneCounts: 'gene_counts',
  geneIndices: 'gene_indices',
  geneIndptr: 'gene_indptr'
} as const;

export const createZarrPaths = (baseUrl: string): ZarrPathBuilder => {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const join = (sub: string) => `${base}/${sub}`;

  return {
    cells: {
      base: () => join(ZARR_SUBPATHS.cells.base),
      segmentation: (folder) => join(ZARR_SUBPATHS.cells.segmentation(folder)),
      field: (folder, field) => join(ZARR_SUBPATHS.cells.field(folder, field))
    },
    images: {
      multiplex: (level) => join(ZARR_SUBPATHS.images.multiplex(level)),
      h_and_e: (level) => join(ZARR_SUBPATHS.images.h_and_e(level))
    },
    transcripts: {
      base: () => join(ZARR_SUBPATHS.transcripts.base),
      tile: (params) => join(ZARR_SUBPATHS.transcripts.tile(params)),
      tileField: (params) => join(ZARR_SUBPATHS.transcripts.tileField(params))
    },
    directSeq: {
      base: () => join(ZARR_SUBPATHS.directSeq.base),
      tile: (params) => join(ZARR_SUBPATHS.directSeq.tile(params)),
      tileField: (params) => join(ZARR_SUBPATHS.directSeq.tileField(params))
    },
    attrs: {
      root: () => join(ZARR_SUBPATHS.attrs.root),
      group: () => join(ZARR_SUBPATHS.attrs.group),
      transcripts: () => join(ZARR_SUBPATHS.attrs.transcripts),
      directSeq: () => join(ZARR_SUBPATHS.attrs.directSeq),
      multiplexLevel: (level) => join(ZARR_SUBPATHS.attrs.multiplexLevel(level)),
      images: () => join(ZARR_SUBPATHS.attrs.images),
      cells: () => join(ZARR_SUBPATHS.attrs.cells),
      cellsSegmentation: (folder) => join(ZARR_SUBPATHS.attrs.cellsSegmentation(folder))
    },
    misc: {
      summary: () => join(ZARR_SUBPATHS.misc.summary)
    }
  };
};
