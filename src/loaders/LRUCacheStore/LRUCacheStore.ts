type StoreValue = Uint8Array | undefined;

type InnerStore = {
  get(key: string): Promise<StoreValue>;
};

/**
 * Wraps any zarrita-compatible store with an LRU cache (Map with size limit).
 * Prevents redundant disk reads when panning back over viewed regions.
 * Misses are cached too — zarrita repeatedly probes keys that do not exist.
 */
export class LRUCacheStore {
  readonly __localZarrStore = true;
  private inner: InnerStore;
  private cache: Map<string, StoreValue>;
  private maxSize: number;

  constructor(inner: InnerStore, maxSize = 100) {
    this.inner = inner;
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  async get(key: string): Promise<StoreValue> {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    const value = await this.inner.get(key);
    this.cache.set(key, value);

    if (this.cache.size > this.maxSize) {
      // Evict oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    return value;
  }
}
