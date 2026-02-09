import { open, FetchStore, get } from 'zarrita';
import axios from 'axios';
import { SingleMask, SegmentationMetadata, ColormapEntry } from '../shared/types';
import { ZarrCellsData } from './ZarrDataSet.types';

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
      totalGenesArray,
      umapArray,
      proteinNamesArray,
      geneNamesArray,
      genesDataArray,
      genesIndicesArray,
      genesIndptrArray
    ] = await Promise.all([
      open(new FetchStore(`${cellsPath}/metadata/cell_id`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/metadata/area`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/metadata/cluster_id`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/polygons/polygon_offsets`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/polygons/polygon_vertices_xy`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/protein/protein_values`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/metadata/total_counts`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/metadata/total_genes`), { kind: 'array' }),
      open(new FetchStore(`${cellsPath}/metadata/umap`), { kind: 'array' }).catch(() => null),
      open(new FetchStore(`${cellsPath}/protein/protein_names`), { kind: 'array' }).catch(() => null),
      open(new FetchStore(`${cellsPath}/genes/gene_names`), { kind: 'array' }).catch(() => null),
      open(new FetchStore(`${cellsPath}/genes/data`), { kind: 'array' }).catch(() => null),
      open(new FetchStore(`${cellsPath}/genes/indices`), { kind: 'array' }).catch(() => null),
      open(new FetchStore(`${cellsPath}/genes/indptr`), { kind: 'array' }).catch(() => null)
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
      totalGenesChunk,
      umapChunk,
      proteinNamesChunk,
      geneNamesChunk,
      genesDataChunk,
      genesIndicesChunk,
      genesIndptrChunk
    ] = await Promise.all([
      get(cellIdArray),
      get(areaArray),
      get(clusterIdArray),
      get(polygonOffsetsArray),
      get(polygonVerticesArray),
      get(proteinValuesArray),
      get(totalCountsArray),
      get(totalGenesArray),
      umapArray ? get(umapArray) : null,
      proteinNamesArray ? get(proteinNamesArray) : null,
      geneNamesArray ? get(geneNamesArray) : null,
      genesDataArray ? get(genesDataArray) : null,
      genesIndicesArray ? get(genesIndicesArray) : null,
      genesIndptrArray ? get(genesIndptrArray) : null
    ]);

    const cellIds = cellIdsChunk.data as Uint32Array;
    const areas = areasChunk.data as Uint16Array;
    const clusterIds = clusterIdsChunk.data as any;
    const polygonOffsets = polygonOffsetsChunk.data as BigInt64Array;
    const polygonVertices = polygonVerticesChunk.data as Float64Array;
    const proteinValues = proteinValuesChunk.data as Uint16Array;
    const totalCounts = totalCountsChunk.data as Uint16Array;
    const totalGenes = totalGenesChunk.data as Uint16Array;
    const umapData = umapChunk?.data as Float32Array | null;

    const proteinNames: string[] = [];
    if (proteinNamesChunk?.data) {
      const proteinNamesData = proteinNamesChunk.data as any;
      const numProteins = proteinNamesArray?.shape[0] as number;
      for (let i = 0; i < numProteins; i++) {
        const name = proteinNamesData.get ? proteinNamesData.get(i) : String(proteinNamesData[i]);
        proteinNames.push(name);
      }
    }

    const geneNames: string[] = [];
    if (geneNamesChunk?.data) {
      const geneNamesData = geneNamesChunk.data as any;
      const numGenes = geneNamesArray?.shape[0] as number;
      for (let i = 0; i < numGenes; i++) {
        const name = geneNamesData.get ? geneNamesData.get(i) : String(geneNamesData[i]);
        geneNames.push(name);
      }
    }

    const genesData = genesDataChunk?.data as Int16Array | null;
    const genesIndices = genesIndicesChunk?.data as Int32Array | null;
    const genesIndptr = genesIndptrChunk?.data as BigInt64Array | null;

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

      const umapValues = umapData ? { umapX: umapData[i * 2], umapY: umapData[i * 2 + 1] } : { umapX: 0, umapY: 0 };

      const nonzeroGeneIndices: number[] = [];
      const nonzeroGeneValues: number[] = [];

      if (genesData && genesIndices && genesIndptr) {
        const rowStart = Number(genesIndptr[i]);
        const rowEnd = Number(genesIndptr[i + 1]);

        for (let j = rowStart; j < rowEnd; j++) {
          nonzeroGeneIndices.push(genesIndices[j]);
          nonzeroGeneValues.push(genesData[j]);
        }
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

    const colormap = await loadColormapFromZarr(zarrBaseUrl, Array.from(clusterSet));

    const metadata: SegmentationMetadata = {
      proteinNames: proteinNames,
      geneNames: geneNames
    };

    return { cellMasks, colormap, metadata };
  } catch (error) {
    throw new Error(`Failed to load cells from Zarr: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function loadColormapFromZarr(zarrBaseUrl: string, clusterIds: string[]): Promise<ColormapEntry[]> {
  try {
    const response = await axios.get(`${zarrBaseUrl}/cells/metadata/.zattrs`);
    const clusterIdColors = response.data.clusterID_colors;

    if (!clusterIdColors) {
      throw new Error('clusterID_colors not found in .zattrs');
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
  } catch (error) {
    throw new Error(`Colormap must be provided in ${zarrBaseUrl}/cells/metadata/.zattrs`);
  }
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
