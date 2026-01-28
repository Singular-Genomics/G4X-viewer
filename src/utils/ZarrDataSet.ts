import { open, FetchStore, get } from 'zarrita';
import axios from 'axios';
import {
  ZarrLayerConfig,
  ZarrGeneColors,
  ZarrTileCoordinates,
  ZarrTranscriptTileData,
  ZarrTranscriptPoint
} from './ZarrDataSet.types';

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

  constructor(zarrUrl: string) {
    this.zarrURL = zarrUrl.endsWith('/') ? zarrUrl.slice(0, -1) : zarrUrl;
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
    return `${this.zarrURL}/images/multiplex`;
  }

  public getHAndEPath(): string {
    return `${this.zarrURL}/images/h_and_e`;
  }

  public async fetchRunMetadata(): Promise<Record<string, any> | null> {
    try {
      const response = await axios.get(`${this.zarrURL}/.zattrs`);
      return response.data.run_metadata || null;
    } catch (error) {
      console.error('Failed to fetch run metadata from .zattrs:', error);
      return null;
    }
  }

  public async fetchTranscriptLayerConfig(): Promise<ZarrLayerConfig | null> {
    try {
      const response = await axios.get(`${this.zarrURL}/transcripts/.zattrs`);
      const layerConfig = response.data.layer_config;
      if (!layerConfig) {
        return null;
      }
      return {
        layer_width: layerConfig.layer_width,
        layer_height: layerConfig.layer_height,
        layers: layerConfig.layers,
        tile_size: layerConfig.tile_size
      };
    } catch (error) {
      console.error('Failed to fetch transcript layer config:', error);
      return null;
    }
  }

  public async fetchTranscriptColors(): Promise<ZarrGeneColors | null> {
    try {
      const response = await axios.get(`${this.zarrURL}/transcripts/.zattrs`);
      return response.data.gene_colors || null;
    } catch (error) {
      console.error('Failed to fetch transcript colors:', error);
      return null;
    }
  }

  public async detectLayerConfig(): Promise<ZarrLayerConfig | null> {
    try {
      const transcriptConfig = await this.fetchTranscriptLayerConfig();
      if (transcriptConfig) {
        return transcriptConfig;
      }

      const response = await axios.get(`${this.zarrURL}/images/multiplex/0/.zarray`);
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
        await axios.head(`${this.zarrURL}/images/multiplex/${level}/.zarray`);
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

      const zStr = `p${invertedZ}`;
      const yStr = `y${String(y).padStart(2, '0')}`;
      const xStr = `x${String(x).padStart(2, '0')}`;
      const basePath = `${this.zarrURL}/transcripts/${zStr}/${yStr}/${xStr}`;

      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        open(new FetchStore(`${basePath}/cell_id`), { kind: 'array' }).catch(() => null),
        open(new FetchStore(`${basePath}/gene_name`), { kind: 'array' }).catch(() => null),
        open(new FetchStore(`${basePath}/position`), { kind: 'array' }).catch(() => null)
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

  public async fetchCellsData(): Promise<import('./ZarrCellsLoader').ZarrCellsData> {
    const { loadCellsFromZarr } = await import('./ZarrCellsLoader');
    return loadCellsFromZarr(this.zarrURL);
  }
}
