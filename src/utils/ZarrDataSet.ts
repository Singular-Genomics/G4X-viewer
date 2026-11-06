import { open, get, FetchStore, Location } from 'zarrita';
import axios from 'axios';
import type {
  ZarrLayerConfig,
  ZarrGeneColors,
  ZarrTranscriptAttrs,
  ZarrTileCoordinates,
  ZarrTranscriptTileData,
  ZarrTranscriptField,
  ZarritaReadableStore,
  ZarrCellsData,
  ZarrCellsSegmentations,
  ZarritaStoreFactory,
  ZarrRunMetadata
} from './ZarrDataSet.types';
import { createZarrPaths, ZARR_SUBPATHS, ZARR_CELL_FIELDS } from './ZarrPaths';
import { GeneRegistry } from './GeneRegistry';
import { ConsolidatedStore } from './ConsolidatedStore';
import { GeneGroupedTranscriptSource } from './GeneGroupedTranscriptSource';
import { decodeLegacyTile, decodeSplitTile, emptyTile } from './transcriptTileDecode';
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
 * - transcripts: /transcripts/p{z}/y{yy}/x{xx}/{cell_id,gene_name,position} (legacy)
 *     or {cell_id,gene_index,position} (split) when layer_config.format_version == 2
 * - run_metadata: stored in .zattrs at root level
 */
type TranscriptContext = {
  layerConfig: ZarrLayerConfig;
  registry: GeneRegistry;
  store: ZarritaReadableStore;
};

export class ZarrDataSet {
  private zarrURL: string;
  private paths: ReturnType<typeof createZarrPaths>;
  private transcriptAttrs: ZarrTranscriptAttrs | null = null;
  private transcriptContext: Promise<TranscriptContext> | null = null;
  private warnedBadLayout = false;
  private geneGroupedSource: Promise<GeneGroupedTranscriptSource | null> | null = null;
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

  constructor(zarrUrl: string, storeFactory?: ZarritaStoreFactory, options: { noCache?: boolean } = {}) {
    this.zarrURL = zarrUrl.endsWith('/') ? zarrUrl.slice(0, -1) : zarrUrl;
    this.paths = createZarrPaths(this.zarrURL);
    this.isCustomStore = !!storeFactory;
    this.storeFactory =
      storeFactory ??
      ((subpath: string) =>
        options.noCache
          ? new NoCacheFetchStore(this.zarrURL + '/' + subpath)
          : new FetchStore(this.zarrURL + '/' + subpath));
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

  /**
   * Resolves everything needed to decode tiles once: layer_config, gene_order -> GeneRegistry and the store
   * (wrapped with .zmetadata when the dataset provides consolidated metadata).
   */
  public getTranscriptContext(): Promise<TranscriptContext> {
    if (!this.transcriptContext) {
      this.transcriptContext = this.buildTranscriptContext().catch((error) => {
        this.transcriptContext = null;
        throw error;
      });
    }
    return this.transcriptContext;
  }

  private async buildTranscriptContext(): Promise<TranscriptContext> {
    const attrs = await this.fetchTranscriptAttrs();
    const layerConfig = attrs.layer_config;
    if (!layerConfig) throw new Error('Dataset has no transcript layer_config');
    let store: ZarritaReadableStore = this.storeFactory(ZARR_SUBPATHS.transcripts.base);
    if (layerConfig.consolidated_metadata) {
      store = (await ConsolidatedStore.tryOpen(store)) ?? store;
    }
    // v2 gene_index values index gene_index_names (frozen at write time). Writers always emit it; fall back to
    // gene_order (identical at write time) with a warning rather than crashing on a malformed dataset.
    const isV2 = (layerConfig.format_version ?? 1) >= 2;
    let geneOrder = attrs.gene_order;
    if (isV2) {
      geneOrder = layerConfig.gene_index_names;
      if (!geneOrder) {
        console.warn('Transcript layer_config.gene_index_names missing: falling back to gene_order');
        geneOrder = attrs.gene_order;
      }
    }
    return { layerConfig, registry: new GeneRegistry(geneOrder ?? []), store };
  }

  /**
   * The gene-grouped transcript store (`transcripts_by_gene/`), or null when the dataset has none / it is stale.
   * Only called once a gene filter is on, so datasets without a filter never touch the group.
   */
  public getGeneGroupedSource(): Promise<GeneGroupedTranscriptSource | null> {
    if (!this.geneGroupedSource) {
      this.geneGroupedSource = this.getTranscriptContext()
        .then(({ layerConfig }) =>
          (layerConfig.format_version ?? 1) >= 2
            ? GeneGroupedTranscriptSource.open(this.storeFactory(ZARR_SUBPATHS.transcriptsByGene.base), layerConfig)
            : null
        )
        .catch((error) => {
          console.warn('Gene-grouped transcript store unavailable, using the GPU filter:', error);
          return null;
        });
    }
    return this.geneGroupedSource;
  }

  private async openTileArray(store: ZarritaReadableStore, tilePath: string, field: ZarrTranscriptField) {
    // attrs: false skips the .zattrs request (tile arrays have none) and the Zarr v3 fallback probe for missing
    // tiles. Transcript data is Zarr v2 only.
    const location = new Location(store as any, `/${tilePath}/${field}`);
    return open.v2(location, { kind: 'array', attrs: false }).catch(() => null);
  }

  /**
   * Fetch and decode one transcript tile into typed arrays.
   * `level` is the p-index (0 = full resolution), `y`/`x` the tile coordinates inside that level.
   */
  public async loadTranscriptTile(level: number, y: number, x: number): Promise<ZarrTranscriptTileData> {
    const { layerConfig, registry, store } = await this.getTranscriptContext();
    // store is rooted at transcripts/, so drop that prefix from the tile path
    const tilePath = ZARR_SUBPATHS.transcripts
      .tile({ z: level, y, x })
      .slice(ZARR_SUBPATHS.transcripts.base.length + 1);
    const tileSize = (layerConfig.tile_size / Math.pow(2, layerConfig.layers)) * Math.pow(2, level);

    if ((layerConfig.format_version ?? 1) < 2) {
      const [cellIdArray, geneNameArray, positionArray] = await Promise.all([
        this.openTileArray(store, tilePath, 'cell_id'),
        this.openTileArray(store, tilePath, 'gene_name'),
        this.openTileArray(store, tilePath, 'position')
      ]);
      if (!cellIdArray || !geneNameArray || !positionArray) return emptyTile();
      const [cellIdChunk, geneNameChunk, positionChunk] = await Promise.all([
        get(cellIdArray),
        get(geneNameArray),
        get(positionArray)
      ]);
      return decodeLegacyTile(
        positionChunk.data as Int32Array,
        geneNameChunk.data as any,
        cellIdChunk.data as Int32Array,
        registry
      );
    }

    if (layerConfig.layout !== 'split') {
      if (!this.warnedBadLayout) {
        this.warnedBadLayout = true;
        console.error(`Unsupported transcript tile layout '${layerConfig.layout}': tiles will be empty`);
      }
      return emptyTile();
    }
    // 4.1 positions are always tile-relative uint16
    const origin = { x: x * tileSize, y: y * tileSize };
    const [cellIdArray, geneIndexArray, positionArray] = await Promise.all([
      this.openTileArray(store, tilePath, 'cell_id'),
      this.openTileArray(store, tilePath, 'gene_index'),
      this.openTileArray(store, tilePath, 'position')
    ]);
    if (!cellIdArray || !geneIndexArray || !positionArray) return emptyTile();
    const [cellIdChunk, geneIndexChunk, positionChunk] = await Promise.all([
      get(cellIdArray),
      get(geneIndexArray),
      get(positionArray)
    ]);
    return decodeSplitTile(
      positionChunk.data as Uint16Array,
      geneIndexChunk.data as Uint16Array,
      cellIdChunk.data as Int32Array,
      origin
    );
  }

  public async getTranscriptTileData({ z, y, x }: ZarrTileCoordinates): Promise<ZarrTranscriptTileData | null> {
    try {
      const { layerConfig } = await this.getTranscriptContext();
      return await this.loadTranscriptTile(layerConfig.layers - z, y, x);
    } catch (error) {
      console.error(`Failed to fetch transcript tile data [z:${z}, y:${y}, x:${x}]:`, error);
      return null;
    }
  }

  /** Gene registry (index -> name) shared by every tile loaded through this dataset. */
  public async getGeneRegistry(): Promise<GeneRegistry> {
    return (await this.getTranscriptContext()).registry;
  }

  /** Raw decoded tile for ROI detection: `invertedZ` is the p-index. */
  public async getTranscriptTileRawData(
    invertedZ: number,
    y: number,
    x: number
  ): Promise<{ tile: ZarrTranscriptTileData; geneNames: string[] } | null> {
    try {
      const { registry } = await this.getTranscriptContext();
      const tile = await this.loadTranscriptTile(invertedZ, y, x);
      if (tile.length === 0) return null;
      return { tile, geneNames: registry.names };
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

  public async fetchSummaryHtmlBlob(): Promise<Blob | null> {
    const [dir, file] = ZARR_SUBPATHS.misc.summary.split('/');
    const store = this.storeFactory(dir);
    const data = await store.get(`/${file}`);
    if (!data) return null;

    const content =
      data.buffer instanceof ArrayBuffer ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : data.slice();

    return new Blob([content], { type: 'text/html;charset=utf-8' });
  }
}
