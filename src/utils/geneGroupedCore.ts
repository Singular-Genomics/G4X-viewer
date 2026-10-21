/**
 * Pure helpers for the gene-grouped transcript store (`transcripts_by_gene`): manifest types, chunk selection,
 * level choice, chunk decoding and a bounded LRU. No I/O and no imports so they can be unit tested in isolation.
 */

export const GENE_GROUP_FORMAT = 'g4x-tx-by-gene';
export const GENE_GROUP_VERSION = 1;

/**
 * Max rows (points) of the selected genes drawn at once before falling back to a coarser level. Single knob to tune.
 *
 * Memory per point in filtered mode: 12 B on the JS heap (Float32 x, y + Int32 cell id) + about 12 B of GPU attribute
 * (deck instances a vec3 position) = ~24 B, i.e. 4M points = ~97 MB. For reference the unfiltered full view of the
 * 10.6M-point dataset (known OK) costs ~150 MB of tile data plus bucket buffers, ~350 MB measured. While the level
 * changes the old and the new view are resident together (see planRendered): 2 x 4M x 24 B = ~190 MB, still below that
 * known-OK figure, which keeps an 8 GB unified-memory machine comfortable.
 */
export const GENE_LEVEL_ROW_BUDGET = 4_000_000;
/** Moving to a finer level than the current one requires the estimate to be at most this fraction of the budget. */
export const GENE_LEVEL_HYSTERESIS = 0.8;
/**
 * Row cap of the chunk cache. Chunks of the current and the drawn view are pinned and never evicted, so the cap only
 * bounds the extra, off-screen history. 1.5 x budget leaves room for one full view (<= budget, chunk granular) plus
 * recently visited chunks to pan back to without refetching.
 */
export const GENE_CACHE_MAX_ROWS = GENE_LEVEL_ROW_BUDGET * 1.5;

export type TileRange = [number, number];

export type GeneGroupManifest = {
  format: string;
  version: number;
  gene_names: string[];
  chunk_rows: number;
  levels: number[];
  grid: Record<string, [number, number]>;
  tile_size: Record<string, number>;
  array_template: { dtype?: string; compressor?: Record<string, unknown> | null } & Record<string, unknown>;
  source: { transcripts_layer_config_sha1: string } & Record<string, unknown>;
  genes: Record<string, { n: Record<string, number>; ranges: Record<string, TileRange[]> }>;
};

/** Inclusive range of visible tile coordinates at one level. */
export type TileRect = { x0: number; y0: number; x1: number; y1: number };

/**
 * Python's `json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=True)` for JSON-native values
 * (integers, strings, booleans, null, arrays, objects; floats are not allowed in layer_config).
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'string') return escapeNonAscii(JSON.stringify(value));
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    // Python sorts keys by code point; default JS sort compares UTF-16 units (identical below U+10000)
    const keys = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort();
    return `{${keys.map((key) => `${escapeNonAscii(JSON.stringify(key))}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  throw new Error('Value is not JSON serialisable');
}

const escapeNonAscii = (json: string) =>
  json.replace(/[\u007f-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

/** Tile index rectangle covered by `bounds` ([minX, minY, maxX, maxY] in layer px), clamped to the grid; null if empty. */
export function visibleTileRect(
  bounds: readonly [number, number, number, number],
  tileSize: number,
  grid: readonly [number, number]
): TileRect | null {
  const [nx, ny] = grid;
  const x0 = Math.max(0, Math.floor(bounds[0] / tileSize));
  const y0 = Math.max(0, Math.floor(bounds[1] / tileSize));
  const x1 = Math.min(nx - 1, Math.floor(bounds[2] / tileSize));
  const y1 = Math.min(ny - 1, Math.floor(bounds[3] / tileSize));
  return x0 > x1 || y0 > y1 ? null : { x0, y0, x1, y1 };
}

/** True when some tile of `rect` has an id (tile_y * nx + tile_x) inside the inclusive id range. */
export function rangeIntersectsRect(range: TileRange, rect: TileRect, nx: number): boolean {
  const [first, last] = range;
  const yFirst = Math.max(rect.y0, Math.floor(first / nx));
  const yLast = Math.min(rect.y1, Math.floor(last / nx));
  for (let y = yFirst; y <= yLast; y++) {
    const lo = Math.max(first, y * nx + rect.x0);
    const hi = Math.min(last, y * nx + rect.x1);
    if (lo <= hi) return true;
  }
  return false;
}

/** Indices of the chunks (one id range each) that contain at least one visible tile. */
export function selectChunks(ranges: readonly TileRange[], rect: TileRect | null, nx: number): number[] {
  const selected: number[] = [];
  if (!rect) return selected;
  for (let k = 0; k < ranges.length; k++) if (rangeIntersectsRect(ranges[k], rect, nx)) selected.push(k);
  return selected;
}

/** Valid rows of chunk `k` of an array with `n` rows (the last chunk is padded on disk). */
export const chunkRowCount = (n: number, chunkRows: number, k: number) =>
  Math.max(0, Math.min(chunkRows, n - k * chunkRows));

/** Rows the selected genes would load for `level` in `rect` (whole chunks overlapping the rect). */
export function estimateRows(
  manifest: GeneGroupManifest,
  geneIdx: readonly number[],
  level: number,
  rect: TileRect | null
) {
  const grid = manifest.grid[level];
  if (!rect || !grid) return 0;
  let rows = 0;
  for (const idx of geneIdx) {
    const gene = manifest.genes[idx];
    const ranges = gene?.ranges[level];
    if (!ranges) continue;
    const n = gene.n[level] ?? 0;
    for (const k of selectChunks(ranges, rect, grid[0])) rows += chunkRowCount(n, manifest.chunk_rows, k);
  }
  return rows;
}

/**
 * Finest level in [0, zoomLevel] whose estimate fits the budget, else `zoomLevel`. Levels finer than `current`
 * additionally need the estimate to be at most `hysteresis * budget`, which stops oscillation around the budget.
 */
export function chooseLevel(opts: {
  zoomLevel: number;
  current: number | null;
  estimate: (level: number) => number;
  budget?: number;
  hysteresis?: number;
}): number {
  const { zoomLevel, current, estimate, budget = GENE_LEVEL_ROW_BUDGET, hysteresis = GENE_LEVEL_HYSTERESIS } = opts;
  for (let level = 0; level < zoomLevel; level++) {
    const limit = current !== null && level < current ? budget * hysteresis : budget;
    if (estimate(level) <= limit) return level;
  }
  return zoomLevel;
}

/**
 * Which chunks to draw after a view change or a chunk arrival. `lookup(key)`: the chunk, null = known empty/failed,
 * undefined = still loading. Never draws two levels at once (that would double-draw points):
 *  - the wanted view is complete -> draw exactly the wanted chunks (previous view dropped, atomic swap);
 *  - incomplete and the drawn chunks are of the wanted level (a pan/zoom inside it, or a gene change) -> keep the
 *    drawn chunks and add the loaded wanted ones;
 *  - incomplete and the drawn chunks are of another level -> keep drawing the previous level until the new one is
 *    fully loaded (no blank flash, no overlap).
 */
export function planRendered<T extends { level: number }>(
  rendered: ReadonlyMap<string, T>,
  wanted: readonly { key: string; level: number }[],
  lookup: (key: string) => T | null | undefined
): Map<string, T> {
  const loaded = new Map<string, T>();
  let complete = true;
  for (const { key } of wanted) {
    const chunk = lookup(key);
    if (chunk === undefined) complete = false;
    else if (chunk) loaded.set(key, chunk);
  }
  if (complete) return loaded;
  const wantedLevel = wanted[0]?.level;
  for (const chunk of rendered.values()) if (chunk.level !== wantedLevel) return new Map(rendered);
  return new Map([...rendered, ...loaded]);
}

/** int32 (rows, 3) = [x, y, cell_id] -> Float32 positions + Int32 cell ids (copies, so the raw buffer can be dropped). */
export function decodeChunkRows(raw: Uint8Array, rows: number) {
  const ints =
    raw.byteOffset % 4 === 0
      ? new Int32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4))
      : new Int32Array(raw.slice().buffer);
  const count = Math.min(rows, Math.floor(ints.length / 3));
  const positions = new Float32Array(count * 2);
  const cellId = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    positions[2 * i] = ints[3 * i];
    positions[2 * i + 1] = ints[3 * i + 1];
    cellId[i] = ints[3 * i + 2];
  }
  return { length: count, positions, cellId };
}

/** LRU keyed by string, capped by total rows. Pinned keys are never evicted (the cache may exceed the cap then). */
export class RowLru<T extends { length: number }> {
  private map = new Map<string, T>();
  private rows = 0;
  private pinned: ReadonlySet<string> = new Set();

  constructor(private maxRows: number) {}

  /** Looks up without changing recency */
  peek(key: string) {
    return this.map.get(key);
  }

  /** Looks up and marks as most recently used */
  get(key: string) {
    const value = this.map.get(key);
    if (value !== undefined) {
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }

  set(key: string, value: T) {
    const old = this.map.get(key);
    if (old) this.rows -= old.length;
    this.map.delete(key);
    this.map.set(key, value);
    this.rows += value.length;
    this.evict();
  }

  setPinned(keys: ReadonlySet<string>) {
    this.pinned = keys;
    this.evict();
  }

  clear() {
    this.map.clear();
    this.rows = 0;
    this.pinned = new Set();
  }

  private evict() {
    if (this.rows <= this.maxRows) return;
    for (const [key, value] of this.map) {
      if (this.rows <= this.maxRows) break;
      if (this.pinned.has(key)) continue;
      this.map.delete(key);
      this.rows -= value.length;
    }
  }
}
