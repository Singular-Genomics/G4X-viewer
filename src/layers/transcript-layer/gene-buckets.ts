/**
 * Merges the gene-store chunks that are drawn into a few bucket buffers (one ScatterplotLayer each) instead of one layer
 * per 16k-row chunk: deck only picks the first 255 pickable layers and pays per layer. No value imports (unit tested).
 */

/** The part of a decoded chunk the buckets need (see GeneChunk) */
export type BucketChunk = {
  key: string;
  level: number;
  geneIdx: number;
  chunk: number;
  length: number;
  positions: Float32Array;
  cellId: Int32Array;
  geneName: string;
};

/** Consecutive chunks of one gene sharing a bucket: 32 x 16k rows = 512k rows (~5 MB) per bucket */
export const GENE_BUCKET_CHUNKS = 32;
/** Genes are spread over this many buckets per chunk group, so many genes do not mean many layers */
export const GENE_BUCKET_GENE_SLOTS = 4;

export type GeneBucket = {
  key: string;
  /** member chunks in draw order (sorted by gene, chunk); identity is the membership signature */
  chunks: BucketChunk[];
  /** chunks[k] owns merged points [starts[k], starts[k + 1]) */
  starts: Uint32Array;
  positions: Float32Array;
  /** Per-point lookup index into the gene lookup texture */
  geneLookup: Uint16Array;
  data: { length: number; attributes: Record<string, { value: Float32Array | Uint16Array; size: number }> };
};

export const bucketKeyOf = (c: Pick<BucketChunk, 'level' | 'geneIdx' | 'chunk'>) =>
  `${c.level}-${c.geneIdx % GENE_BUCKET_GENE_SLOTS}-${Math.floor(c.chunk / GENE_BUCKET_CHUNKS)}`;

const sameChunks = (a: readonly BucketChunk[], b: readonly BucketChunk[]) =>
  a.length === b.length && a.every((c, i) => c === b[i]);

export function buildGeneBucket(
  key: string,
  chunks: BucketChunk[],
  lookupIndexOf: (name: string) => number | undefined
) {
  const starts = new Uint32Array(chunks.length + 1);
  for (let k = 0; k < chunks.length; k++) starts[k + 1] = starts[k] + chunks[k].length;
  const length = starts[chunks.length];
  const positions = new Float32Array(length * 2);
  const geneLookup = new Uint16Array(length);
  for (let k = 0; k < chunks.length; k++) {
    positions.set(chunks[k].positions.subarray(0, chunks[k].length * 2), starts[k] * 2);
    geneLookup.fill(lookupIndexOf(chunks[k].geneName) ?? 0, starts[k], starts[k + 1]);
  }
  const bucket: GeneBucket = {
    key,
    chunks,
    starts,
    positions,
    geneLookup,
    data: {
      length,
      attributes: { getPosition: { value: positions, size: 2 }, getGeneIndex: { value: geneLookup, size: 1 } }
    }
  };
  return bucket;
}

/**
 * Groups the drawn chunks into buckets, reusing a previous bucket object (=> no GPU re-upload) whenever its member
 * chunks are unchanged (lookup indices of a gene name never change). Chunks whose gene has no lookup index are skipped. Iterates in a stable order.
 */
export function updateGeneBuckets(
  rendered: Iterable<BucketChunk>,
  previous: ReadonlyMap<string, GeneBucket>,
  lookupIndexOf: (name: string) => number | undefined
) {
  const groups = new Map<string, BucketChunk[]>();
  for (const c of rendered) {
    if (c.length === 0 || lookupIndexOf(c.geneName) === undefined) continue;
    const key = bucketKeyOf(c);
    const group = groups.get(key);
    if (group) group.push(c);
    else groups.set(key, [c]);
  }
  const next = new Map<string, GeneBucket>();
  for (const key of [...groups.keys()].sort()) {
    const chunks = groups.get(key)!.sort((a, b) => a.geneIdx - b.geneIdx || a.chunk - b.chunk);
    const old = previous.get(key);
    if (old && sameChunks(old.chunks, chunks)) next.set(key, old);
    else next.set(key, buildGeneBucket(key, chunks, lookupIndexOf));
  }
  return next;
}

/** Maps a point index inside a bucket back to its chunk and the index local to that chunk. */
export function resolveGeneBucketIndex(bucket: GeneBucket, index: number) {
  if (index < 0 || index >= bucket.data.length) return null;
  const { starts } = bucket;
  let lo = 0;
  let hi = bucket.chunks.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return { chunk: bucket.chunks[lo], localIndex: index - starts[lo] };
}
