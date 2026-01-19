import { open, FetchStore, get } from 'zarrita';
import { SingleMask, SegmentationMetadata, ColormapEntry } from '../shared/types';

export interface ZarrCellsData {
  cellMasks: SingleMask[];
  colormap: ColormapEntry[];
  metadata: SegmentationMetadata;
}

export async function loadCellsFromZarr(zarrBaseUrl: string): Promise<ZarrCellsData> {
  const cellsPath = `${zarrBaseUrl}/cells`;

  try {
    const [
      cellIdArray,
      areaArray,
      clusterIdArray,
      polygonOffsetsArray,
      polygonVerticesArray,
      proteinValuesArray,
      totalCountsArray,
      totalGenesArray
    ] = await Promise.all([
      open(new FetchStore(`${cellsPath}/cell_id`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/area`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/cluster_id`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/polygon_offsets`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/polygon_vertices_xy`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/protein_values`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/total_counts`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/total_genes`), { kind: 'array' })
    ]);

    const numCells = cellIdArray.shape[0] as number;

    const [
      cellIdsChunk,
      areasChunk,
      clusterIdsChunk,
      polygonOffsetsChunk,
      polygonVerticesChunk,
      proteinValuesChunk,
      totalCountsChunk,
      totalGenesChunk
    ] = await Promise.all([
      get(cellIdArray),
      get(areaArray),
      get(clusterIdArray),
      get(polygonOffsetsArray),
      get(polygonVerticesArray),
      get(proteinValuesArray),
      get(totalCountsArray),
      get(totalGenesArray)
    ]);

    const cellIds = cellIdsChunk.data as Uint32Array;
    const areas = areasChunk.data as Uint16Array;
    const clusterIds = clusterIdsChunk.data as any;
    const polygonOffsets = polygonOffsetsChunk.data as BigInt64Array;
    const polygonVertices = polygonVerticesChunk.data as Float64Array;
    const proteinValues = proteinValuesChunk.data as Uint16Array;
    const totalCounts = totalCountsChunk.data as Uint16Array;
    const totalGenes = totalGenesChunk.data as Uint16Array;

    console.log('clusterIds type:', clusterIds.constructor.name);
    console.log('clusterIds sample:', clusterIds.get ? clusterIds.get(0) : clusterIds[0]);

    const cellMasks: SingleMask[] = [];
    const clusterSet = new Set<string>();

    for (let i = 0; i < numCells; i++) {
      const vsStart = Number(polygonOffsets[i]);
      const vsEnd = Number(polygonOffsets[i + 1]);

      const vertices: number[] = [];
      for (let j = vsStart; j < vsEnd; j++) {
        vertices.push(polygonVertices[j * 2]);
        vertices.push(polygonVertices[j * 2 + 1]);
      }

      const numProteins = proteinValuesArray.shape[1] as number;
      const proteinVals: number[] = [];
      for (let p = 0; p < numProteins; p++) {
        proteinVals.push(proteinValues[i * numProteins + p]);
      }

      const clusterId = clusterIds.get ? clusterIds.get(i) : String(clusterIds[i]);
      clusterSet.add(clusterId);

      cellMasks.push({
        cellId: String(cellIds[i]),
        area: areas[i],
        clusterId: clusterId,
        vertices: vertices,
        proteinValues: proteinVals,
        totalCounts: totalCounts[i],
        totalGenes: totalGenes[i],
        nonzeroGeneIndices: [], // Not available in Zarr /cells
        nonzeroGeneValues: [], // Not available in Zarr /cells
        umapValues: { umapX: 0, umapY: 0 } // Not available in Zarr /cells
      });
    }

    const colormap = generateColormap(Array.from(clusterSet)); // Generated locally, not in Zarr
    const metadata: SegmentationMetadata = {
      proteinNames: [],
      geneNames: [] // Not available in Zarr /cells
    };

    return { cellMasks, colormap, metadata };
  } catch (error) {
    console.error('Error loading cells from Zarr:', error);
    throw new Error(`Failed to load cells from Zarr: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateColormap(clusterIds: string[]): ColormapEntry[] {
  const colorPalette = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
    [255, 0, 255],
    [0, 255, 255],
    [255, 128, 0],
    [128, 0, 255],
    [0, 255, 128],
    [128, 128, 128]
  ];

  return clusterIds.map((clusterId, index) => ({
    clusterId,
    color: colorPalette[index % colorPalette.length]
  }));
}

export async function extractProteinNamesFromMetadata(metadata: Record<string, any>): Promise<string[]> {
  try {
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
  } catch (error) {
    console.error('Error extracting protein names:', error);
    return [];
  }
}
