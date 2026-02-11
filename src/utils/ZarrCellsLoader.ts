import { open, FetchStore, get } from 'zarrita';
import { SingleMask, SegmentationMetadata, ColormapEntry } from '../shared/types';
import { ZarrCellsData } from './ZarrDataSet.types';
import { ZarrDataSet } from './ZarrDataSet';

export async function loadCellsFromZarr(zarrDataSet: ZarrDataSet): Promise<ZarrCellsData> {
  try {
    const cellsGroup = await open(new FetchStore(zarrDataSet.getCellsBasePath()), { kind: 'group' });

    const [metadataGroup, polygonsGroup, proteinGroup, genesGroup] = await Promise.all([
      open(cellsGroup.resolve('metadata'), { kind: 'group' }),
      open(cellsGroup.resolve('polygons'), { kind: 'group' }),
      open(cellsGroup.resolve('protein'), { kind: 'group' }),
      open(cellsGroup.resolve('genes'), { kind: 'group' })
    ]);

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
      openAndGet(metadataGroup.resolve('cell_id')),
      openAndGet(metadataGroup.resolve('area')),
      openAndGet(metadataGroup.resolve('cluster_id')),
      openAndGet(polygonsGroup.resolve('polygon_offsets')),
      openAndGet(polygonsGroup.resolve('polygon_vertices_xy')),
      openAndGet(proteinGroup.resolve('protein_values')),
      openAndGet(metadataGroup.resolve('total_counts')),
      openAndGet(metadataGroup.resolve('total_genes')),
      openAndGet(metadataGroup.resolve('umap')),
      openAndGet(proteinGroup.resolve('protein_names'))
    ]);

    // Load genes separately - many chunks can cause ERR_INSUFFICIENT_RESOURCES
    const [geneNamesChunk, genesDataChunk, genesIndicesChunk, genesIndptrChunk] = await Promise.all([
      openAndGet(genesGroup.resolve('gene_names')),
      openAndGet(genesGroup.resolve('data')),
      openAndGet(genesGroup.resolve('indices')),
      openAndGet(genesGroup.resolve('indptr'))
    ]);

    const cellIds = cellIdsChunk.data as Uint32Array;
    const areas = areasChunk.data as Uint16Array;
    const clusterIds = clusterIdsChunk.data as any;
    const polygonOffsets = polygonOffsetsChunk.data as BigInt64Array;
    const polygonVertices = polygonVerticesChunk.data as Float64Array;
    const proteinValues = proteinValuesChunk.data as Uint16Array;
    const numProteins = proteinValuesChunk.shape[1] as number;
    const totalCounts = totalCountsChunk.data as Uint16Array;
    const totalGenes = totalGenesChunk.data as Uint16Array;
    const umapData = umapChunk.data as Float32Array;

    const proteinNames = extractStringArray(proteinNamesChunk);
    const geneNames = extractStringArray(geneNamesChunk);

    const genesData = genesDataChunk.data as Int16Array;
    const genesIndices = genesIndicesChunk.data as Int32Array;
    const genesIndptr = genesIndptrChunk.data as BigInt64Array;

    const cellMasks: SingleMask[] = [];
    const clusterSet = new Set<string>();

    const numCells = cellIds.length;

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

      const clusterId = clusterIds.get ? clusterIds.get(i) : String(clusterIds[i]);
      clusterSet.add(clusterId);

      const umapValues = { umapX: umapData[i * 2], umapY: umapData[i * 2 + 1] };

      const nonzeroGeneIndices: number[] = [];
      const nonzeroGeneValues: number[] = [];
      const rowStart = Number(genesIndptr[i]);
      const rowEnd = Number(genesIndptr[i + 1]);
      for (let j = rowStart; j < rowEnd; j++) {
        nonzeroGeneIndices.push(genesIndices[j]);
        nonzeroGeneValues.push(genesData[j]);
      }

      cellMasks.push({
        cellId: String(cellIds[i]),
        area: areas[i],
        clusterId: clusterId,
        vertices: vertices,
        proteinValues: proteinVals,
        totalCounts: totalCounts[i],
        totalGenes: totalGenes[i],
        nonzeroGeneIndices: nonzeroGeneIndices,
        nonzeroGeneValues: nonzeroGeneValues,
        umapValues: umapValues
      });
    }

    const colormap = loadColormapFromZarr(metadataGroup.attrs, Array.from(clusterSet));

    const metadata: SegmentationMetadata = {
      proteinNames: proteinNames,
      geneNames: geneNames
    };

    return { cellMasks, colormap, metadata };
  } catch (error) {
    throw new Error(`Failed to load cells from Zarr: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractStringArray(chunk: { data: any; shape: number[] }): string[] {
  const data = chunk.data as any;
  const length = chunk.shape[0];
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(data.get ? data.get(i) : String(data[i]));
  }
  return result;
}

function loadColormapFromZarr(metadataAttrs: Record<string, unknown>, clusterIds: string[]): ColormapEntry[] {
  const clusterIdColors = metadataAttrs.clusterID_colors as Record<string, [number, number, number]> | undefined;

  if (!clusterIdColors) {
    throw new Error('clusterID_colors not found in cells/metadata .zattrs');
  }

  return clusterIds.map((clusterId) => {
    const color = clusterIdColors[clusterId] || clusterIdColors['-1'];
    if (!color) {
      return {
        clusterId,
        color: [128, 128, 128] as [number, number, number]
      };
    }
    return {
      clusterId,
      color: color as [number, number, number]
    };
  });
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
