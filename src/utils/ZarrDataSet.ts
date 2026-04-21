import { open, get, FetchStore } from 'zarrita';
import axios from 'axios';
import type {
  ZarrLayerConfig,
  ZarrGeneColors,
  ZarrTileCoordinates,
  ZarrTranscriptTileData,
  ZarrTranscriptPoint,
  ZarrCellsData,
  ZarrCellsSegmentations,
  ZarrCellTileCoordinates,
  ZarrCellTileData
} from './ZarrDataSet.types';
import type { SingleMask } from '../shared/types';
import { createZarrPaths } from './ZarrPaths';
import { loadCellsFromZarr, parseClusterLabels, type ClusterLabelEntry } from './ZarrCellsLoader';

const noCacheHeaders = { 'Cache-Control': 'no-cache' };

export class NoCacheFetchStore {
  constructor(public url: string) {}

  async get(key: string): Promise<Uint8Array | undefined> {
    const url = `${this.url.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
    const response = await fetch(url, { cache: 'no-cache' });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Request unsuccessful: ${response.statusText}`);
    return new Uint8Array(await response.arrayBuffer());
  }
}

/**
 * ZarrDataSet - manages Zarr structure URL formatting
 *
 * Structure: /{cells,images,transcripts,misc}
 * - images/multiplex: /images/multiplex/{level}
 * - images/h_and_e: /images/h_and_e/{level}
 * - cells/metadata: /cells/metadata/{area,cell_id,cluster_id,total_counts,total_genes,umap}
 * - cells/polygons: /cells/polygons/{polygon_offsets,polygon_vertices_xy}
 * - cells/protein: /cells/protein/{protein_names,protein_values}
 * - cells/genes: /cells/genes/{data,gene_names,indices,indptr}
 * - transcripts: /transcripts/p{z}/y{yy}/x{xx}/{cell_id,gene_name,position}
 * - run_metadata: stored in .zattrs at root level
 */
export class ZarrDataSet {
  private zarrURL: string;
  private paths: ReturnType<typeof createZarrPaths>;
  private transcriptAttrs: { layer_config?: ZarrLayerConfig; gene_colors?: ZarrGeneColors } | null = null;

  private async hasZarrNode(path: string): Promise<boolean> {
    try {
      await axios.head(path, { headers: noCacheHeaders });
      return true;
    } catch {
      return false;
    }
  }

  constructor(zarrUrl: string) {
    this.zarrURL = zarrUrl.endsWith('/') ? zarrUrl.slice(0, -1) : zarrUrl;
    this.paths = createZarrPaths(this.zarrURL);
  }

  public getBaseURL(): string {
    return this.zarrURL;
  }

  public isValid(): boolean {
    return this.zarrURL.includes('.zarr');
  }

  public getZarrDirectoryName(): string {
    const urlParts = this.zarrURL.split('/');
    const zarrDir = urlParts.find((part) => part.endsWith('.zarr'));
    return zarrDir || '';
  }

  public getMultiplexPath(): string {
    return this.paths.images.multiplex();
  }

  public getHAndEPath(): string {
    return this.paths.images.h_and_e();
  }

  public getCellsBasePath(): string {
    return this.paths.cells.base();
  }

  public getTranscriptsBasePath(): string {
    return this.paths.transcripts.base();
  }

  public async hasTranscriptsData(): Promise<boolean> {
    return this.hasZarrNode(this.paths.attrs.transcripts());
  }

  public async hasSegmentationData(): Promise<boolean> {
    return this.hasZarrNode(`${this.paths.cells.base()}/.zgroup`);
  }

  public async fetchImageAxesMetadata(): Promise<{ unit: string; pixel_per_um: number } | null> {
    try {
      const response = await axios.get(this.paths.attrs.images(), { headers: noCacheHeaders });
      const axes = response.data?.axes;
      if (axes?.pixel_per_um) {
        return { unit: axes.unit ?? 'μm', pixel_per_um: axes.pixel_per_um };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch image axes metadata from .zattrs:', error);
      return null;
    }
  }

  public async fetchRunMetadata(): Promise<Record<string, any> | null> {
    try {
      const response = await axios.get(this.paths.attrs.root(), { headers: noCacheHeaders });
      return response.data.run_metadata || null;
    } catch (error) {
      console.error('Failed to fetch run metadata from .zattrs:', error);
      return null;
    }
  }

  private async fetchTranscriptAttrs(): Promise<{ layer_config?: ZarrLayerConfig; gene_colors?: ZarrGeneColors }> {
    if (this.transcriptAttrs) {
      return this.transcriptAttrs;
    }
    try {
      const response = await axios.get(this.paths.attrs.transcripts(), { headers: noCacheHeaders });
      this.transcriptAttrs = response.data;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transcript .zattrs:', error);
      return {};
    }
  }

  public async fetchTranscriptLayerConfig(): Promise<ZarrLayerConfig | null> {
    const attrs = await this.fetchTranscriptAttrs();
    return attrs.layer_config || null;
  }

  public async fetchTranscriptColors(): Promise<ZarrGeneColors | null> {
    const attrs = await this.fetchTranscriptAttrs();
    return attrs.gene_colors || null;
  }

  public async detectLayerConfig(): Promise<ZarrLayerConfig | null> {
    try {
      const transcriptConfig = await this.fetchTranscriptLayerConfig();
      if (transcriptConfig) {
        return transcriptConfig;
      }

      const response = await axios.get(this.paths.attrs.multiplexLevel(0), { headers: noCacheHeaders });
      const metadata = response.data;
      const shape = metadata.shape;
      const chunks = metadata.chunks;

      const pyramidLevels = await this.detectPyramidLevels();

      return {
        layer_width: shape[shape.length - 1],
        layer_height: shape[shape.length - 2],
        layers: pyramidLevels.length > 0 ? pyramidLevels.length - 1 : 4,
        tile_size: chunks[chunks.length - 1]
      };
    } catch (error) {
      console.error('Failed to auto-detect layer config:', error);
      return null;
    }
  }

  private async detectPyramidLevels(): Promise<number[]> {
    const levels: number[] = [];
    for (let level = 0; level <= 10; level++) {
      try {
        await axios.head(this.paths.attrs.multiplexLevel(level), { headers: noCacheHeaders });
        levels.push(level);
      } catch {
        break;
      }
    }
    return levels.length > 0 ? levels : [0, 1, 2, 3, 4];
  }

  public async getTranscriptTileData({ z, y, x }: ZarrTileCoordinates): Promise<ZarrTranscriptTileData | null> {
    try {
      const transcriptConfig = await this.fetchTranscriptLayerConfig();
      const maxZoom = transcriptConfig ? transcriptConfig.layers : 4;
      const invertedZ = maxZoom - z;
      const tileParams = { z: invertedZ, y, x };

      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        open(new NoCacheFetchStore(this.paths.transcripts.tileField({ ...tileParams, field: 'cell_id' })), {
          kind: 'array'
        }).catch(() => null),
        open(new NoCacheFetchStore(this.paths.transcripts.tileField({ ...tileParams, field: 'gene_name' })), {
          kind: 'array'
        }).catch(() => null),
        open(new NoCacheFetchStore(this.paths.transcripts.tileField({ ...tileParams, field: 'position' })), {
          kind: 'array'
        }).catch(() => null)
      ]);

      if (!cellIdArray || !geneNameArray || !positionArray) {
        return { pointsData: [], numberOfPoints: 0 };
      }

      const [cellIdChunk, geneNameChunk, positionChunk] = await Promise.all([
        get(cellIdArray),
        get(geneNameArray),
        get(positionArray)
      ]);

      const cellIds = cellIdChunk.data as Int32Array;
      const geneNames = geneNameChunk.data as any;
      const positions = positionChunk.data as Int32Array;
      const numberOfPoints = cellIds.length;

      const pointsData: ZarrTranscriptPoint[] = [];
      for (let i = 0; i < numberOfPoints; i++) {
        const geneName = geneNames.get ? geneNames.get(i) : String(geneNames[i]);
        pointsData.push({
          cellId: String(cellIds[i]),
          geneName: geneName,
          position: [positions[i * 2], positions[i * 2 + 1]]
        });
      }

      return {
        pointsData,
        numberOfPoints
      };
    } catch (error) {
      console.error(`Failed to fetch transcript tile data [z:${z}, y:${y}, x:${x}]:`, error);
      return null;
    }
  }

  public async fetchCellsSegmentations(): Promise<ZarrCellsSegmentations> {
    const response = await axios.get(`${this.paths.cells.base()}/.zattrs`);
    const attrs = response.data;
    return {
      segmentationOrder: attrs.segmentation_order as string[],
      segmentationSources: attrs.segmentation_sources as Record<string, string>
    };
  }

  public async fetchCellsData(segmentationFolderName: string): Promise<ZarrCellsData> {
    return loadCellsFromZarr(this, segmentationFolderName);
  }

  private async fetchCellsSegmentationAttrs(folder: string): Promise<Record<string, any>> {
    const response = await axios.get(this.paths.attrs.cellsSegmentation(folder), { headers: noCacheHeaders });
    return response.data;
  }

  public async fetchCellsLayerConfig(folder: string): Promise<ZarrLayerConfig | null> {
    try {
      const attrs = await this.fetchCellsSegmentationAttrs(folder);
      const config = attrs.layer_config;
      if (!config) return null;
      return {
        layer_width: config.layer_width,
        layer_height: config.layer_height,
        layers: config.layers,
        tile_size: config.tile_size
      };
    } catch (error) {
      console.error(`Failed to fetch cells layer_config for "${folder}":`, error);
      return null;
    }
  }

  public async fetchCellsClusterLabels(folder: string): Promise<ClusterLabelEntry[]> {
    const attrs = await this.fetchCellsSegmentationAttrs(folder);
    return parseClusterLabels(attrs);
  }

  public async getCellTileData(
    { folder, y, x }: ZarrCellTileCoordinates,
    clusterLabelIndex: number
  ): Promise<ZarrCellTileData | null> {
    try {
      const openField = (field: string) =>
        open(new NoCacheFetchStore(this.paths.cells.tileField({ folder, y, x, field: field as any })), {
          kind: 'array'
        }).catch(() => null);

      const [
        polygonOffsetsArray,
        polygonVerticesArray,
        clusterIdArray,
        cellIdArray,
        areaArray,
        totalCountsArray,
        totalGenesArray
      ] = await Promise.all([
        openField('polygon_offsets'),
        openField('polygon_vertices_xy'),
        openField('cluster_id'),
        openField('cell_id'),
        openField('area'),
        openField('total_counts'),
        openField('total_genes')
      ]);

      if (!polygonOffsetsArray || !polygonVerticesArray || !clusterIdArray || !cellIdArray) {
        return { polygons: [] };
      }

      const [
        polygonOffsetsChunk,
        polygonVerticesChunk,
        clusterIdChunk,
        cellIdChunk,
        areaChunk,
        totalCountsChunk,
        totalGenesChunk
      ] = await Promise.all([
        get(polygonOffsetsArray),
        get(polygonVerticesArray),
        get(clusterIdArray),
        get(cellIdArray),
        areaArray ? get(areaArray) : Promise.resolve(null),
        totalCountsArray ? get(totalCountsArray) : Promise.resolve(null),
        totalGenesArray ? get(totalGenesArray) : Promise.resolve(null)
      ]);

      const polygonOffsets = polygonOffsetsChunk.data as BigInt64Array;
      const polygonVertices = polygonVerticesChunk.data as Float64Array;
      const cellIds = cellIdChunk.data as Uint32Array;
      const clusterIdsRaw = clusterIdChunk.data as any;
      const numLabels = clusterIdChunk.shape[1] as number;
      const areas = (areaChunk?.data as Uint16Array | undefined) ?? null;
      const totalCounts = (totalCountsChunk?.data as Uint16Array | undefined) ?? null;
      const totalGenes = (totalGenesChunk?.data as Uint16Array | undefined) ?? null;

      const numCells = cellIds.length;
      const polygons: SingleMask[] = [];

      for (let i = 0; i < numCells; i++) {
        const vsStart = Number(polygonOffsets[i]);
        const vsEnd = Number(polygonOffsets[i + 1]);

        const vertices: number[] = [];
        for (let j = vsStart; j < vsEnd; j++) {
          vertices.push(polygonVertices[j * 2]);
          vertices.push(polygonVertices[j * 2 + 1]);
        }

        const flatIndex = i * numLabels + clusterLabelIndex;
        const clusterId = clusterIdsRaw.get ? clusterIdsRaw.get(flatIndex) : String(clusterIdsRaw[flatIndex]);

        polygons.push({
          cellId: String(cellIds[i]),
          clusterId,
          vertices,
          area: areas ? areas[i] : 0,
          totalCounts: totalCounts ? totalCounts[i] : 0,
          totalGenes: totalGenes ? totalGenes[i] : 0,
          proteinValues: [],
          nonzeroGeneIndices: [],
          nonzeroGeneValues: [],
          umapValues: { umapX: 0, umapY: 0 }
        });
      }

      return { polygons };
    } catch (error) {
      console.error(`Failed to fetch cell tile data [folder:${folder}, y:${y}, x:${x}]:`, error);
      return null;
    }
  }

  public async fetchClusterIds(segmentationFolderName: string): Promise<{ data: any; columnCount: number }> {
    const cellsBaseUrl = `${this.paths.cells.base()}/${segmentationFolderName}`;
    const clusterIdArray = await open(new FetchStore(`${cellsBaseUrl}/metadata/cluster_id`), { kind: 'array' });
    const chunk = await get(clusterIdArray);
    return { data: chunk.data, columnCount: chunk.shape[1] };
  }

  public async fetchSummaryHtml(): Promise<string | null> {
    try {
      const response = await axios.get(this.paths.misc.summary(), {
        responseType: 'text',
        headers: noCacheHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch summary.html:', error);
      return null;
    }
  }
}
