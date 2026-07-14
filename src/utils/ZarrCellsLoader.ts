import { open, get } from 'zarrita';
import { NoCacheFetchStore } from './ZarrDataSet';
import { SingleMask, SegmentationMetadata, ColormapEntry } from '../shared/types';
import { ZarrCellsData, ZarritaStoreFactory } from './ZarrDataSet.types';
import { ZarrDataSet } from './ZarrDataSet';
import { createZarrPaths, ZARR_SUBPATHS, ZARR_CELL_FIELDS } from './ZarrPaths';

export type ClusterLabelEntry = {
  key: string;
  displayName: string;
  // Column index in the 2D cluster_id array [N, numLabels]
  index: number;
  clusterIdColors: Record<string, [number, number, number]>;
  clusterIdOrder: string[];
};

export async function loadCellsFromZarr(
  zarrDataSet: ZarrDataSet,
  segmentationFolderName: string
): Promise<ZarrCellsData> {
  const paths = createZarrPaths(zarrDataSet.getBaseURL());
  const cellsGroup = await open(new NoCacheFetchStore(paths.cells.segmentation(segmentationFolderName)), {
    kind: 'group'
  });
  return loadCellsFromGroup(cellsGroup);
}

export async function loadCellsFromStoreFactory(
  storeFactory: ZarritaStoreFactory,
  segmentationFolderName: string
): Promise<ZarrCellsData> {
  const cellsGroup = await open(storeFactory(ZARR_SUBPATHS.cells.segmentation(segmentationFolderName)) as any, {
    kind: 'group'
  });
  return loadCellsFromGroup(cellsGroup);
}

export async function fetchClusterIdsFromStoreFactory(
  storeFactory: ZarritaStoreFactory,
  segmentationFolderName: string
): Promise<{ data: any; columnCount: number }> {
  const clusterIdArray = await open(
    storeFactory(ZARR_SUBPATHS.cells.field(segmentationFolderName, ZARR_CELL_FIELDS.clusterId)) as any,
    { kind: 'array' }
  );
  const chunk = await get(clusterIdArray);
  return { data: chunk.data, columnCount: chunk.shape[1] };
}

async function loadCellsFromGroup(cellsGroup: any): Promise<ZarrCellsData> {
  try {
    const openAndGet = (location: Parameters<typeof open>[0]) => open(location, { kind: 'array' }).then(get);

    const [
      cellIdsChunk,
      areasChunk,
      clusterIdsChunk,
      polygonOffsetsChunk,
      polygonVerticesChunk,
      proteinValuesChunk,
      totalCountsChunk,
      totalGenesChunk,
      umapChunk,
      proteinNamesChunk
    ] = await Promise.all([
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.cellId)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.area)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.clusterId)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.polygonOffsets)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.polygonVerticesXy)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.proteinValues)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.totalCounts)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.totalGenes)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.umap)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.proteinNames))
    ]);

    // Load genes separately - many chunks can cause ERR_INSUFFICIENT_RESOURCES
    const [geneNamesChunk, geneCountsChunk, geneIndicesChunk, geneIndptrChunk] = await Promise.all([
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.geneNames)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.geneCounts)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.geneIndices)),
      openAndGet(cellsGroup.resolve(ZARR_CELL_FIELDS.geneIndptr))
    ]);

    const cellIds = cellIdsChunk.data as Uint32Array;
    const areas = areasChunk.data as Uint16Array;
    const polygonOffsets = polygonOffsetsChunk.data as BigInt64Array;
    const polygonVertices = polygonVerticesChunk.data as Float16Array;
    const proteinValues = proteinValuesChunk.data as Float16Array;
    const numProteins = proteinValuesChunk.shape[1] as number;
    const totalCounts = totalCountsChunk.data as Uint16Array;
    const totalGenes = totalGenesChunk.data as Uint16Array;
    const umapData = umapChunk.data as Float16Array;

    const proteinNames = extractStringArray(proteinNamesChunk);
    const geneNames = extractStringArray(geneNamesChunk);

    const geneCounts = geneCountsChunk.data as Uint16Array;
    const geneIndices = geneIndicesChunk.data as Int32Array;
    const geneIndptr = geneIndptrChunk.data as Int32Array;

    const clusterLabels = parseClusterLabels(cellsGroup.attrs);
    const defaultLabel = clusterLabels[0];

    // cluster_id is a 2D array [N, numLabels]; use index from .zattrs for each label
    const columnCount = clusterIdsChunk.shape[1];
    const clusterIdsRaw = clusterIdsChunk.data as any;

    const getClusterId = (i: number, columnIndex: number): string => {
      const flatIndex = i * columnCount + columnIndex;
      return clusterIdsRaw.get ? clusterIdsRaw.get(flatIndex) : String(clusterIdsRaw[flatIndex]);
    };

    const numCells = cellIds.length;
    const cellMasks: SingleMask[] = [];

    // Yield to the browser before the synchronous loop so the loading UI can paint
    await new Promise((resolve) => setTimeout(resolve, 0));

    for (let i = 0; i < numCells; i++) {
      const vsStart = Number(polygonOffsets[i]);
      const vsEnd = Number(polygonOffsets[i + 1]);

      const vertices: number[] = [];
      for (let j = vsStart; j < vsEnd; j++) {
        vertices.push(polygonVertices[j * 2]);
        vertices.push(polygonVertices[j * 2 + 1]);
      }

      const proteinVals: number[] = [];
      for (let p = 0; p < numProteins; p++) {
        proteinVals.push(proteinValues[i * numProteins + p]);
      }

      const nonzeroGeneIndices: number[] = [];
      const nonzeroGeneValues: number[] = [];
      const rowStart = Number(geneIndptr[i]);
      const rowEnd = Number(geneIndptr[i + 1]);
      for (let j = rowStart; j < rowEnd; j++) {
        nonzeroGeneIndices.push(geneIndices[j]);
        nonzeroGeneValues.push(geneCounts[j]);
      }

      cellMasks.push({
        cellId: String(cellIds[i]),
        area: areas[i],
        clusterId: getClusterId(i, defaultLabel.index),
        vertices,
        proteinValues: proteinVals,
        totalCounts: totalCounts[i],
        totalGenes: totalGenes[i],
        nonzeroGeneIndices,
        nonzeroGeneValues,
        umapValues: { umapX: umapData[i * 2], umapY: umapData[i * 2 + 1] }
      });
    }

    const colormap = buildColormap(defaultLabel);
    const metadata: SegmentationMetadata = { proteinNames, geneNames };

    return { cellMasks, colormap, metadata, clusterLabels };
  } catch (error) {
    throw new Error(`Failed to load cells from Zarr: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseClusterLabels(metadataAttrs: Record<string, unknown>): ClusterLabelEntry[] {
  const clusterLabelsRaw = metadataAttrs.cluster_labels as Record<
    string,
    { clusterID_colors: Record<string, [number, number, number]>; clusterID_order: string[]; index: number }
  >;
  const clusterLabelsOrder = metadataAttrs.cluster_labels_order as string[];

  if (!clusterLabelsRaw || !clusterLabelsOrder) {
    throw new Error('cluster_labels or cluster_labels_order not found in metadata .zattrs');
  }

  return clusterLabelsOrder.map((key) => {
    const entry = clusterLabelsRaw[key];
    return {
      key,
      displayName: key,
      index: entry.index,
      clusterIdColors: entry.clusterID_colors,
      clusterIdOrder: entry.clusterID_order
    };
  });
}

export function buildColormap(label: ClusterLabelEntry): ColormapEntry[] {
  return label.clusterIdOrder.map((clusterId) => ({
    clusterId,
    color: (label.clusterIdColors[clusterId] ?? [128, 128, 128]) as [number, number, number]
  }));
}

export function extractStringArray(chunk: { data: any; shape: number[] }): string[] {
  const data = chunk.data as any;
  const length = chunk.shape[0];
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(data.get ? data.get(i) : String(data[i]));
  }
  return result;
}

export function extractProteinNamesFromMetadata(metadata: Record<string, any>): string[] {
  const proteinPanel = metadata?.run_metadata?.protein_panel;
  if (!proteinPanel || !Array.isArray(proteinPanel)) {
    return [];
  }

  return proteinPanel.map((entry: string) => {
    if (entry.includes('/')) {
      const filename = entry.split('/').pop() || entry;
      return filename.replace('.csv', '');
    }
    return entry;
  });
}
