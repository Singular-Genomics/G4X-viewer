import { open, get, FetchStore } from 'zarrita';
import axios from 'axios';
import type {
  ZarrLayerConfig,
  ZarrGeneColors,
  ZarrTranscriptAttrs,
  ZarrTileCoordinates,
  ZarrTranscriptTileData,
  ZarrTranscriptPoint,
  ZarrCellsData,
  ZarrCellsSegmentations,
  ZarritaStoreFactory,
  ZarrRunMetadata
} from './ZarrDataSet.types';
import { createZarrPaths, ZARR_SUBPATHS, ZARR_CELL_FIELDS } from './ZarrPaths';
import { loadCellsFromZarr, loadCellsFromStoreFactory, fetchClusterIdsFromStoreFactory } from './ZarrCellsLoader';

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

// Skips .zattrs requests — transcript tile arrays have no .zattrs, zarrita treats undefined as empty attrs.
class SkipAttrsFetchStore extends NoCacheFetchStore {
  override async get(key: string): Promise<Uint8Array | undefined> {
    if (key.endsWith('.zattrs')) return undefined;
    return super.get(key);
  }
}

/**
 * ZarrDataSet - manages Zarr structure URL formatting
 *
 * Structure: /{cells,images,transcripts,misc}
 * - images/multiplex: /images/multiplex/{level}
 * - images/h_and_e: /images/h_and_e/{level}
 * - cells/{segmentation}: /cells/{segmentation}/{area,cell_id,cluster_id,total_counts,total_genes,umap,
 *     position,polygon_offsets,polygon_vertices_xy,protein_names,protein_values,
 *     gene_names,gene_counts,gene_indices,gene_indptr}
 *   (cluster_labels & cluster_labels_order live in /cells/{segmentation}/.zattrs)
 * - transcripts: /transcripts/p{z}/y{yy}/x{xx}/{cell_id,gene_name,position}
 * - run_metadata: stored in .zattrs at root level
 */
export class ZarrDataSet {
  private zarrURL: string;
  private paths: ReturnType<typeof createZarrPaths>;
  private transcriptAttrs: ZarrTranscriptAttrs | null = null;
  private storeFactory: ZarritaStoreFactory;
  private isCustomStore: boolean;

  private async hasZarrNode(path: string): Promise<boolean> {
    try {
      const response = await axios.head(path, { headers: noCacheHeaders });
      const contentType = response.headers['content-type'] ?? '';
      return !contentType.includes('text/html');
    } catch {
      return false;
    }
  }

  constructor(zarrUrl: string, storeFactory?: ZarritaStoreFactory) {
    this.zarrURL = zarrUrl.endsWith('/') ? zarrUrl.slice(0, -1) : zarrUrl;
    this.paths = createZarrPaths(this.zarrURL);
    this.isCustomStore = !!storeFactory;
    this.storeFactory = storeFactory ?? ((subpath: string) => new FetchStore(this.zarrURL + '/' + subpath));
  }

  public getBaseURL(): string {
    return this.zarrURL;
  }

  public isValid(): boolean {
    return /\.zarr\/?$/.test(this.zarrURL);
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

  public async isAccessible(): Promise<boolean> {
    const [hasGroup, hasAttrs] = await Promise.all([
      this.hasZarrNode(this.paths.attrs.group()),
      this.hasZarrNode(this.paths.attrs.root())
    ]);
    return hasGroup || hasAttrs;
  }

  public async hasImagesData(): Promise<boolean> {
    return this.hasZarrNode(this.paths.attrs.images());
  }

  public async hasTranscriptsData(): Promise<boolean> {
    const layerConfig = await this.fetchTranscriptLayerConfig();
    return layerConfig !== null;
  }

  public async hasSegmentationData(): Promise<boolean> {
    return this.hasZarrNode(`${this.paths.cells.base()}/${ZARR_SUBPATHS.attrs.group}`);
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

  public async fetchRunMetadata(): Promise<ZarrRunMetadata | null> {
    try {
      const response = await axios.get(this.paths.attrs.root(), { headers: noCacheHeaders });
      const metadata = response.data.run_metadata;
      if (!metadata) return null;
      return {
        metadata,
        smpInfoOrder: response.data.smp_info_order ?? []
      };
    } catch (error) {
      console.error('Failed to fetch run metadata from .zattrs:', error);
      return null;
    }
  }

  private async fetchTranscriptAttrs(): Promise<ZarrTranscriptAttrs> {
    if (this.transcriptAttrs) {
      return this.transcriptAttrs;
    }
    try {
      const store = this.storeFactory(ZARR_SUBPATHS.transcripts.base);
      const data = await store.get(`/${ZARR_SUBPATHS.attrs.root}`);
      if (data) {
        const decoded = JSON.parse(new TextDecoder().decode(data));
        this.transcriptAttrs = decoded;
        return decoded;
      }
      // Fallback to axios for HTTP stores that may not support .zattrs via get()
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

  public async fetchTranscriptGeneOrder(): Promise<string[] | null> {
    const attrs = await this.fetchTranscriptAttrs();
    return attrs.gene_order || null;
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

      const tileField = (field: 'cell_id' | 'gene_name' | 'position') =>
        ZARR_SUBPATHS.transcripts.tileField({ z: invertedZ, y, x, field });

      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        open(this.storeFactory(tileField('cell_id')) as any, { kind: 'array' }).catch(() => null),
        open(this.storeFactory(tileField('gene_name')) as any, { kind: 'array' }).catch(() => null),
        open(this.storeFactory(tileField('position')) as any, { kind: 'array' }).catch(() => null)
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

  public async getTranscriptTileRawData(
    invertedZ: number,
    y: number,
    x: number
  ): Promise<{ cellIds: Int32Array; geneNames: unknown; positions: Int32Array; count: number } | null> {
    try {
      const tileParams = { z: invertedZ, y, x };

      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        open(new SkipAttrsFetchStore(this.paths.transcripts.tileField({ ...tileParams, field: 'cell_id' })), {
          kind: 'array'
        }).catch(() => null),
        open(new SkipAttrsFetchStore(this.paths.transcripts.tileField({ ...tileParams, field: 'gene_name' })), {
          kind: 'array'
        }).catch(() => null),
        open(new SkipAttrsFetchStore(this.paths.transcripts.tileField({ ...tileParams, field: 'position' })), {
          kind: 'array'
        }).catch(() => null)
      ]);

      if (!cellIdArray || !geneNameArray || !positionArray) return null;

      const [cellIdChunk, geneNameChunk, positionChunk] = await Promise.all([
        get(cellIdArray),
        get(geneNameArray),
        get(positionArray)
      ]);

      return {
        cellIds: cellIdChunk.data as Int32Array,
        geneNames: geneNameChunk.data,
        positions: positionChunk.data as Int32Array,
        count: (cellIdChunk.data as Int32Array).length
      };
    } catch (error) {
      console.error(`Failed to fetch transcript tile raw data [invertedZ:${invertedZ}, y:${y}, x:${x}]:`, error);
      return null;
    }
  }

  public async fetchCellsSegmentations(): Promise<ZarrCellsSegmentations> {
    const response = await axios.get(this.paths.attrs.cells());
    const attrs = response.data;
    return {
      segmentationOrder: attrs.segmentation_order as string[],
      segmentationSources: attrs.segmentation_sources as Record<string, string>
    };
  }

  public async fetchCellsData(segmentationFolderName: string): Promise<ZarrCellsData> {
    if (this.isCustomStore) {
      return loadCellsFromStoreFactory(this.storeFactory, segmentationFolderName);
    }
    return loadCellsFromZarr(this, segmentationFolderName);
  }

  public async fetchClusterIds(segmentationFolderName: string): Promise<{ data: any; columnCount: number }> {
    if (this.isCustomStore) {
      return fetchClusterIdsFromStoreFactory(this.storeFactory, segmentationFolderName);
    }
    const clusterIdArray = await open(
      new FetchStore(this.paths.cells.field(segmentationFolderName, ZARR_CELL_FIELDS.clusterId)),
      { kind: 'array' }
    );
    const chunk = await get(clusterIdArray);
    return { data: chunk.data, columnCount: chunk.shape[1] };
  }

  public async fetchSummaryHtml(): Promise<string | null> {
    try {
      const [dir, file] = ZARR_SUBPATHS.misc.summary.split('/');
      const store = this.storeFactory(dir);
      const data = await store.get(`/${file}`);
      if (data) return new TextDecoder().decode(data);
      return null;
    } catch (error) {
      console.error('Failed to fetch summary.html:', error);
      return null;
    }
  }
}
