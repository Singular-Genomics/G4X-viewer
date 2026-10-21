import { pointBounds, type Bounds } from './pick-culling';
import type { LayerDataItem } from './transcript-layer.types';

/**
 * Max tiles per bucket (= per draw call). Buckets are consecutive runs of the tile order deck's TileLayer draws in:
 * `tileset.tiles` = cache insertion order (tile creation), stably sorted by zoom (deck tileset-2d.ts `_resizeCache`).
 * A tile's run is `floor(seq / BUCKET_TILES)`, where `seq` is a per-zoom counter assigned the first time the tile is
 * seen. `seq` never changes, so a bucket's membership changes only when one of ITS tiles appears, loads, reloads,
 * becomes (in)visible or is evicted; no other bucket is touched.
 */
export const BUCKET_TILES = 64;

/** Bookkeeping bytes charged per cached tile on top of its typed arrays (object, bbox, Tile2DHeader, ...). */
export const TILE_OVERHEAD_BYTES = 512;

export type TileBucket = {
  key: string;
  /** member tiles in draw order; identity of these items is the bucket's membership signature */
  items: LayerDataItem[];
  /** items[k] owns concatenated points [starts[k], starts[k + 1]) */
  starts: Uint32Array;
  positions: Float32Array;
  geneIndex: Uint16Array;
  bounds: Bounds;
  /** Stable binary payload for deck (same object while the membership is unchanged => GPU buffers are kept) */
  data: { length: number; attributes: Record<string, { value: Float32Array | Uint16Array; size: number }> };
};

/** A visible tile, in draw order, with the key of the bucket (run) it belongs to. */
export type BucketEntry = { item: LayerDataItem; key: string };

/** Tile content as stored in deck's cache: the tile item plus the `byteLength` Tileset2D needs for maxCacheByteSize. */
export type TileContent = LayerDataItem[] & { byteLength: number };

/**
 * Wraps a tile item as deck tile content. `byteLength` is constant (deck adds it on load and subtracts it on evict, so
 * it must not change afterwards). It counts the bytes the tile logically owns, whether they currently live in its own
 * arrays or in a bucket buffer that its arrays are views of, so it stays accurate after `buildBucket` re-points them.
 * That holds because a bucket buffer is exactly the sum of its members' data and `detachTile` gives a tile its own
 * compact copy as soon as it leaves a bucket, so a tile never keeps a larger buffer alive than its own data.
 */
export function makeTileContent(item: LayerDataItem): TileContent {
  const { positions, geneIndex, cellId } = item.points;
  const content = [item] as TileContent;
  content.byteLength = positions.byteLength + geneIndex.byteLength + cellId.byteLength + TILE_OVERHEAD_BYTES;
  return content;
}

/** Assigns every tile a stable per-zoom sequence number the first time it is observed (in `tileset.tiles` order). */
export class TileSequencer<T extends object> {
  private seq = new WeakMap<T, number>();
  private counters = new Map<number, number>();

  /** Must be called for every tile of `tileset.tiles` in order (loaded or not): creation order defines the draw order */
  bucketKey(tile: T, z: number): string {
    let s = this.seq.get(tile);
    if (s === undefined) {
      s = this.counters.get(z) ?? 0;
      this.counters.set(z, s + 1);
      this.seq.set(tile, s);
    }
    return `${z}-${Math.floor(s / BUCKET_TILES)}`;
  }
}

export const sameItems = (a: readonly LayerDataItem[], b: readonly LayerDataItem[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

/**
 * Concatenates the tiles (in the given order, each keeping its own point order) into one buffer pair and then
 * re-points every tile's `positions` / `geneIndex` at views of that buffer, releasing the tile's own copy: the bucket
 * holds the only copy of those columns. (`cellId` stays tile-owned; it is only needed for picking.)
 */
export function buildBucket(key: string, items: LayerDataItem[]): TileBucket {
  const starts = new Uint32Array(items.length + 1);
  for (let k = 0; k < items.length; k++) starts[k + 1] = starts[k] + items[k].points.length;
  const length = starts[items.length];
  const positions = new Float32Array(length * 2);
  const geneIndex = new Uint16Array(length);
  for (let k = 0; k < items.length; k++) {
    const { points } = items[k];
    positions.set(points.positions.subarray(0, points.length * 2), starts[k] * 2);
    geneIndex.set(points.geneIndex.subarray(0, points.length), starts[k]);
  }
  for (let k = 0; k < items.length; k++) {
    const { points } = items[k];
    points.positions = positions.subarray(starts[k] * 2, starts[k + 1] * 2);
    points.geneIndex = geneIndex.subarray(starts[k], starts[k + 1]);
  }
  return {
    key,
    items,
    starts,
    positions,
    geneIndex,
    bounds: pointBounds(positions, length),
    data: {
      length,
      attributes: {
        getPosition: { value: positions, size: 2 },
        getGeneIndex: { value: geneIndex, size: 1 }
      }
    }
  };
}

/** Replaces a tile's views of a bucket buffer by compact copies so the (replaced/dropped) buffer can be freed. */
function detachTile(item: LayerDataItem) {
  const { points } = item;
  points.positions = points.positions.slice();
  points.geneIndex = points.geneIndex.slice();
}

/**
 * Groups the visible tiles (already in draw order) into buckets, reusing a previous bucket (same object => no
 * re-upload) whenever its member tiles are exactly the same. Only buckets whose membership changed are rebuilt.
 * Tiles without points are skipped. The returned Map iterates in draw order.
 */
export function updateBuckets(entries: readonly BucketEntry[], previous: ReadonlyMap<string, TileBucket>) {
  const groups = new Map<string, LayerDataItem[]>();
  for (const { item, key } of entries) {
    if (item.points.length === 0) continue;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  const next = new Map<string, TileBucket>();
  let changed = false;
  for (const [key, items] of groups) {
    const old = previous.get(key);
    if (old && sameItems(old.items, items)) next.set(key, old);
    else {
      next.set(key, buildBucket(key, items));
      changed = true;
    }
  }
  // Tiles that left a replaced/dropped bucket still view its buffer: copy them out (after the new buckets were built,
  // which read from those views). Unchanged frames skip this entirely.
  if (changed || previous.size !== next.size) {
    const members = new Set<LayerDataItem>();
    for (const bucket of next.values()) for (const item of bucket.items) members.add(item);
    for (const [key, old] of previous) {
      if (next.get(key) === old) continue;
      for (const item of old.items) if (!members.has(item)) detachTile(item);
    }
  }
  return next;
}

/** Maps a point index inside a bucket back to its tile and the index local to that tile. */
export function resolveBucketIndex(bucket: TileBucket, index: number) {
  if (index < 0 || index >= bucket.data.length) return null;
  const { starts } = bucket;
  let lo = 0;
  let hi = bucket.items.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return { item: bucket.items[lo], localIndex: index - starts[lo] };
}
