import { registry as codecRegistry } from 'zarrita';
import type { ZarritaReadableStore, ZarrLayerConfig } from './ZarrDataSet.types';
import {
  GENE_CACHE_MAX_ROWS,
  GENE_GROUP_FORMAT,
  GENE_GROUP_VERSION,
  RowLru,
  canonicalJson,
  chunkRowCount,
  decodeChunkRows,
  selectChunks,
  type GeneGroupManifest,
  type TileRect
} from './geneGroupedCore';

export type GeneChunk = {
  /** Cache key `${level}/${geneIdx}/${chunk}` */
  key: string;
  level: number;
  geneIdx: number;
  geneName: string;
  /** Chunk number within the (level, gene) array */
  chunk: number;
  length: number;
  /** Interleaved x, y in absolute layer px */
  positions: Float32Array;
  cellId: Int32Array;
  /** Stable binary payload for deck (same object => GPU buffer kept) */
  data: { length: number; attributes: { getPosition: { value: Float32Array; size: number } } };
};

/** A chunk that could not be loaded (network / decode error). Unlike an empty chunk it is not cached: retry later. */
export const CHUNK_FAILED = 'failed';
export type ChunkResult = GeneChunk | null | undefined | typeof CHUNK_FAILED;

export type ChunkRef = { key: string; level: number; geneIdx: number; chunk: number };

type ChunkCodec = { decode(bytes: Uint8Array): Promise<Uint8Array> | Uint8Array };

const MAX_CONCURRENT_LOADS = 8;

export const chunkKey = (level: number, geneIdx: number, chunk: number) => `${level}/${geneIdx}/${chunk}`;

const sha1Hex = async (text: string) => {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Reads `transcripts_by_gene/`: per-(level, gene) int32 (N, 3) arrays [x, y, cell_id] split in chunks of `chunk_rows`
 * rows, with the manifest listing the tile-id range of every chunk so only chunks near the viewport are fetched.
 * Array metadata comes from the manifest template (no .zarray requests). Decoded chunks live in a row-capped LRU.
 */
export class GeneGroupedTranscriptSource {
  private cache = new RowLru<GeneChunk>(GENE_CACHE_MAX_ROWS);
  private inFlight = new Map<string, Promise<ChunkResult>>();
  private queue: (() => void)[] = [];
  private active = 0;
  private generation = 0;
  private codec: Promise<ChunkCodec | null> | null = null;
  private nameToIdx: Map<string, number>;

  private constructor(
    private store: ZarritaReadableStore,
    readonly manifest: GeneGroupManifest
  ) {
    this.nameToIdx = new Map(manifest.gene_names.map((name, i) => [name, i]));
  }

  /**
   * Resolves null when the group is absent (silent: the normal "no store" case), malformed, of another version or
   * stale w.r.t. `transcripts/` (warned once: the GPU filter is used instead).
   */
  static async open(store: ZarritaReadableStore, layerConfig: ZarrLayerConfig) {
    let reason: string;
    try {
      const bytes = await store.get('/.zattrs');
      if (!bytes) return null;
      const manifest = JSON.parse(new TextDecoder().decode(bytes)) as GeneGroupManifest;
      if (manifest.format !== GENE_GROUP_FORMAT || manifest.version !== GENE_GROUP_VERSION) {
        reason = `unsupported format ${manifest.format} v${manifest.version}`;
      } else if (manifest.source?.transcripts_layer_config_sha1 !== (await sha1Hex(canonicalJson(layerConfig)))) {
        reason = 'fingerprint does not match transcripts/ (stale)';
      } else {
        return new GeneGroupedTranscriptSource(store, manifest);
      }
    } catch (error) {
      reason = `bad manifest (${error instanceof Error ? error.message : String(error)})`;
    }
    console.warn(`transcripts_by_gene unavailable, using the GPU gene filter: ${reason}`);
    return null;
  }

  /** Manifest gene index (index space of `g{idx}` arrays), undefined if the gene has no rows in the store. */
  geneIndex(name: string) {
    return this.nameToIdx.get(name);
  }

  /** Chunks of the given genes at `level` that contain a visible tile. */
  plan(geneIdx: readonly number[], level: number, rect: TileRect | null): ChunkRef[] {
    const grid = this.manifest.grid[level];
    const refs: ChunkRef[] = [];
    if (!grid) return refs;
    for (const idx of geneIdx) {
      const ranges = this.manifest.genes[idx]?.ranges[level];
      if (!ranges) continue;
      for (const chunk of selectChunks(ranges, rect, grid[0])) {
        refs.push({ key: chunkKey(level, idx, chunk), level, geneIdx: idx, chunk });
      }
    }
    return refs;
  }

  peek(key: string) {
    return this.cache.peek(key);
  }

  /** Chunks that must survive eviction (visible or currently drawn) */
  setPinned(keys: ReadonlySet<string>) {
    this.cache.setPinned(keys);
  }

  /**
   * Drops every cached chunk; loads still in flight are discarded when they finish. Queued loads are run so they
   * resolve (as undefined: their generation is stale) instead of staying pending forever.
   */
  clearCache() {
    this.generation++;
    this.cache.clear();
    this.inFlight.clear();
    const queued = this.queue;
    this.queue = [];
    for (const job of queued) job();
  }

  /**
   * Cached chunk, or a (de-duplicated, concurrency limited) load. `shouldLoad` is checked when the load reaches the
   * head of the queue so requests for a viewport the user already left are skipped (resolves undefined). Resolves
   * null when the chunk is empty or missing and CHUNK_FAILED when loading it failed (not cached: ask again).
   */
  load(ref: ChunkRef, shouldLoad: () => boolean = () => true): Promise<ChunkResult> {
    const cached = this.cache.get(ref.key);
    if (cached) return Promise.resolve(cached);
    const pending = this.inFlight.get(ref.key);
    if (pending) return pending;
    const generation = this.generation;
    const promise = new Promise<ChunkResult>((resolve) => {
      const run = async () => {
        this.active++;
        await null; // `promise` is assigned once the executor returned
        try {
          if (generation !== this.generation || !shouldLoad()) return resolve(undefined);
          const chunk = await this.fetchChunk(ref);
          if (chunk && generation === this.generation) this.cache.set(ref.key, chunk);
          resolve(generation === this.generation ? chunk : undefined);
        } catch (error) {
          console.error(`Failed to load gene chunk ${ref.key}:`, error);
          resolve(generation === this.generation ? CHUNK_FAILED : undefined);
        } finally {
          this.active--;
          if (this.inFlight.get(ref.key) === promise) this.inFlight.delete(ref.key);
          this.queue.shift()?.();
        }
      };
      if (this.active < MAX_CONCURRENT_LOADS) void run();
      else this.queue.push(() => void run());
    });
    this.inFlight.set(ref.key, promise);
    return promise;
  }

  private getCodec() {
    if (!this.codec) {
      const config = this.manifest.array_template.compressor;
      this.codec = config
        ? (async () => {
            const loadCodec = (codecRegistry as Map<string, () => Promise<any>>).get(String(config.id));
            if (!loadCodec) throw new Error(`Unsupported compressor ${String(config.id)}`);
            return (await loadCodec()).fromConfig(config) as ChunkCodec;
          })()
        : Promise.resolve(null);
    }
    return this.codec;
  }

  private async fetchChunk({ key, level, geneIdx, chunk }: ChunkRef): Promise<GeneChunk | null> {
    const { manifest } = this;
    const rows = chunkRowCount(manifest.genes[geneIdx]?.n[level] ?? 0, manifest.chunk_rows, chunk);
    if (rows === 0) return null;
    const path = `/p${level}/g${String(geneIdx).padStart(3, '0')}/${chunk}.0`;
    const bytes = await this.store.get(path);
    if (!bytes) return null;
    const codec = await this.getCodec();
    const { length, positions, cellId } = decodeChunkRows(codec ? await codec.decode(bytes) : bytes, rows);
    return {
      key,
      level,
      geneIdx,
      geneName: manifest.gene_names[geneIdx],
      chunk,
      length,
      positions,
      cellId,
      data: { length, attributes: { getPosition: { value: positions, size: 2 } } }
    };
  }
}
