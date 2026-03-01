import { open, FetchStore, get } from 'zarrita';
import axios from 'axios';
import type {
  ZarrLayerConfig,
  ZarrGeneColors,
  ZarrTileCoordinates,
  ZarrTranscriptTileData,
  ZarrTranscriptPoint,
  ZarrCellsData,
  ZarritaStoreFactory
} from './ZarrDataSet.types';
import { createZarrPaths } from './ZarrPaths';

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
  private storeFactory: ZarritaStoreFactory;

  private async hasZarrNode(path: string): Promise<boolean> {
    try {
      await axios.head(path);
      return true;
    } catch {
      return false;
    }
  }

  constructor(zarrUrl: string, storeFactory?: ZarritaStoreFactory) {
    this.zarrURL = zarrUrl.endsWith('/') ? zarrUrl.slice(0, -1) : zarrUrl;
    this.paths = createZarrPaths(this.zarrURL);
    this.storeFactory = storeFactory ?? ((subpath: string) => new FetchStore(this.zarrURL + '/' + subpath));
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

  public async hasTranscriptsData(): Promise<boolean> {
    return this.hasZarrNode(this.paths.attrs.transcripts());
  }

  public async hasSegmentationData(): Promise<boolean> {
    return this.hasZarrNode(`${this.paths.cells.base()}/.zgroup`);
  }

  public async fetchImageAxesMetadata(): Promise<{ unit: string; pixel_per_um: number } | null> {
    try {
      const response = await axios.get(this.paths.attrs.images());
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
      const response = await axios.get(this.paths.attrs.root());
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
      const store = this.storeFactory('transcripts');
      const data = await store.get('/.zattrs');
      if (data) {
        const decoded = JSON.parse(new TextDecoder().decode(data));
        this.transcriptAttrs = decoded;
        return decoded;
      }
      // Fallback to axios for HTTP stores that may not support .zattrs via get()
      const response = await axios.get(this.paths.attrs.transcripts());
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

      const response = await axios.get(this.paths.attrs.multiplexLevel(0));
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
        await axios.head(this.paths.attrs.multiplexLevel(level));
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
      const tilePath = (field: string) => `transcripts/${zStr}/${yStr}/${xStr}/${field}`;

      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        open(this.storeFactory(tilePath('cell_id')) as any, { kind: 'array' }).catch(() => null),
        open(this.storeFactory(tilePath('gene_name')) as any, { kind: 'array' }).catch(() => null),
        open(this.storeFactory(tilePath('position')) as any, { kind: 'array' }).catch(() => null)
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

  public async fetchCellsData(): Promise<ZarrCellsData> {
    const { loadCellsFromZarr } = await import('./ZarrCellsLoader');
    return loadCellsFromZarr(this.storeFactory);
  }

  public async fetchSummaryHtml(): Promise<string | null> {
    try {
      const response = await axios.get(this.paths.misc.summary(), {
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch summary.html:', error);
      return null;
    }
  }
}
