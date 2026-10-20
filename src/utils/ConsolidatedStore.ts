import type { ZarritaReadableStore } from './ZarrDataSet.types';

const META_KEY = /(^|\/)(\.zarray|\.zgroup|\.zattrs)$/;

/**
 * Serves .zarray/.zgroup/.zattrs from a Zarr v2 consolidated `.zmetadata` document so that opening an array costs no
 * request, and a tile that is not listed (missing/empty) resolves to "not found" without hitting the network.
 * Chunk reads are delegated to the underlying store. Works with HTTP and local-folder stores alike.
 */
export class ConsolidatedStore implements ZarritaReadableStore {
  private encoded = new Map<string, Uint8Array>();

  private constructor(
    private inner: ZarritaReadableStore,
    private metadata: Record<string, unknown>
  ) {}

  static async tryOpen(inner: ZarritaReadableStore): Promise<ConsolidatedStore | null> {
    try {
      const bytes = await inner.get('/.zmetadata');
      if (!bytes) return null;
      const doc = JSON.parse(new TextDecoder().decode(bytes));
      if (doc?.zarr_consolidated_format !== 1 || typeof doc.metadata !== 'object') return null;
      return new ConsolidatedStore(inner, doc.metadata);
    } catch {
      return null;
    }
  }

  async get(key: string, options?: unknown): Promise<Uint8Array | undefined> {
    if (META_KEY.test(key)) {
      const path = key.replace(/^\/+/, '');
      let bytes = this.encoded.get(path);
      if (!bytes) {
        const value = this.metadata[path];
        if (value === undefined) return undefined;
        bytes = new TextEncoder().encode(JSON.stringify(value));
        this.encoded.set(path, bytes);
      }
      return bytes;
    }
    return (this.inner.get as (k: string, o?: unknown) => Promise<Uint8Array | undefined>)(key, options);
  }
}
