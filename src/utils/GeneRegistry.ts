/**
 * Maps gene names <-> dense uint16 indices.
 *
 * Seeded from transcripts/.zattrs `layer_config.gene_index_names` (v2) or `gene_order` so that v2 `gene_index` arrays are already valid indices. Legacy tiles
 * store the gene name per point as fixed-width UCS-4 strings; `mapCodes` converts those to indices with an
 * allocation-free open-addressing hash lookup over the raw code points (no per-point string objects).
 * Names not present in `gene_order` are appended on first sight (`version` is bumped so consumers can refresh).
 */
export class GeneRegistry {
  readonly names: string[] = [];
  version = 0;

  private byName = new Map<string, number>();
  private codes: Int32Array[] = [];
  private table = new Int32Array(0);
  private mask = 0;

  constructor(order: readonly string[] = []) {
    this.resize(Math.max(64, order.length * 4));
    for (const name of order) this.add(name);
    this.version = 0;
  }

  get size(): number {
    return this.names.length;
  }

  indexOf(name: string): number | undefined {
    return this.byName.get(name);
  }

  add(name: string): number {
    const existing = this.byName.get(name);
    if (existing !== undefined) return existing;
    const index = this.names.length;
    if (index >= 0xffff) throw new Error('Too many distinct genes for a uint16 gene index');
    const codePoints = Int32Array.from(Array.from(name), (c) => c.codePointAt(0)!);
    this.names.push(name);
    this.byName.set(name, index);
    this.codes.push(codePoints);
    if (this.names.length * 2 > this.table.length) this.resize(this.table.length * 2);
    else this.insert(index);
    this.version++;
    return index;
  }

  /**
   * Converts `length` fixed-width UCS-4 strings (`chars` code points each, zero padded) to gene indices.
   */
  mapCodes(codes: Int32Array, chars: number, length: number, out: Uint16Array = new Uint16Array(length)): Uint16Array {
    for (let i = 0; i < length; i++) {
      const base = i * chars;
      let h = 2166136261;
      for (let j = 0; j < chars; j++) {
        const c = codes[base + j];
        if (c === 0) break;
        h = Math.imul(h ^ c, 16777619);
      }
      let found = this.probe(codes, base, chars, h);
      if (found < 0) {
        // Gene missing from gene_order: register it (the table may be rebuilt, hence re-probe)
        let end = chars;
        while (end > 0 && codes[base + end - 1] === 0) end--;
        let name = '';
        for (let j = 0; j < end; j++) name += String.fromCodePoint(codes[base + j]);
        found = this.add(name);
      }
      out[i] = found;
    }
    return out;
  }

  private probe(codes: Int32Array, base: number, chars: number, hash: number): number {
    const { table, mask } = this;
    let slot = (hash >>> 0) & mask;
    for (;;) {
      const candidate = table[slot];
      if (candidate < 0) return -1;
      const g = this.codes[candidate];
      const gl = g.length;
      if (gl <= chars) {
        let eq = true;
        for (let j = 0; j < gl; j++) {
          if (codes[base + j] !== g[j]) {
            eq = false;
            break;
          }
        }
        if (eq) {
          for (let j = gl; j < chars; j++) {
            if (codes[base + j] !== 0) {
              eq = false;
              break;
            }
          }
        }
        if (eq) return candidate;
      }
      slot = (slot + 1) & mask;
    }
  }

  private resize(size: number) {
    let n = 64;
    while (n < size) n <<= 1;
    this.table = new Int32Array(n).fill(-1);
    this.mask = n - 1;
    for (let i = 0; i < this.names.length; i++) this.insert(i);
  }

  private insert(index: number) {
    const g = this.codes[index];
    let h = 2166136261;
    for (let j = 0; j < g.length; j++) h = Math.imul(h ^ g[j], 16777619);
    let slot = (h >>> 0) & this.mask;
    while (this.table[slot] >= 0) slot = (slot + 1) & this.mask;
    this.table[slot] = index;
  }
}
